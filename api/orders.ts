import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";
import { isPointInCampusBoundary } from "./_lib/campusBoundary.ts";
import { getAdminDb, getAdminAuth } from "./_lib/firebaseAdmin.ts";

let memoryOrders: any[] = [];

function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) return obj.map(cleanUndefined);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefined(v)])
    );
  }
  return obj;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST: Public customer checkout order placement
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { customerName, customerPhone, items, totalAmount, orderType, note, deliveryLocation } = body;

      if (!customerName || !customerPhone || !items) {
        return res.status(400).json({
          success: false,
          error: "Missing required order fields (customerName, customerPhone, items).",
        });
      }

      // If delivery order, enforce strict CSJMU campus location validation
      if (orderType === "Delivery") {
        if (!deliveryLocation || typeof deliveryLocation !== "object") {
          return res.status(400).json({
            success: false,
            error: "Delivery orders require a confirmed campus delivery location.",
          });
        }

        const { lat, lng, building } = deliveryLocation;
        const numLat = Number(lat);
        const numLng = Number(lng);

        if (isNaN(numLat) || isNaN(numLng) || !isFinite(numLat) || !isFinite(numLng)) {
          return res.status(400).json({
            success: false,
            error: "Invalid or malformed campus delivery coordinates provided.",
          });
        }

        if (!building || !String(building).trim()) {
          return res.status(400).json({
            success: false,
            error: "Please specify the delivery campus building or hostel.",
          });
        }

        const isInside = isPointInCampusBoundary(numLat, numLng);
        if (!isInside) {
          return res.status(400).json({
            success: false,
            error: "Sorry! TCC currently delivers only within the CSJMU university campus.",
          });
        }
      }

      const calculatedTotal = Number(totalAmount) || 0;
      const subtotal = Number(body.subtotal) || calculatedTotal;
      const deliveryFee = orderType === "Delivery" ? Number(body.deliveryFee ?? 40) : 0;
      const discountAmount = Number(body.discountAmount) || 0;

      // Authenticate customer session token if provided
      let authenticatedCustomer: { uid: string; email?: string; email_verified?: boolean } | null = null;
      const authHeader = req.headers?.authorization || req.headers?.Authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        const idToken = authHeader.substring(7).trim();
        const adminAuth = getAdminAuth();
        if (adminAuth && idToken) {
          try {
            const decoded = await adminAuth.verifyIdToken(idToken);
            authenticatedCustomer = {
              uid: decoded.uid,
              email: decoded.email,
              email_verified: decoded.email_verified,
            };
          } catch {
            // Token expired or invalid; fall back gracefully
          }
        }
      }

      const finalCustomerId = authenticatedCustomer ? authenticatedCustomer.uid : (body.customerId || undefined);
      const finalCustomerEmail = authenticatedCustomer?.email || body.customerEmail || undefined;
      const customerSnapshot = {
        uid: finalCustomerId,
        name: String(customerName).trim(),
        phone: String(customerPhone).trim(),
        email: finalCustomerEmail,
        isVerified: authenticatedCustomer ? Boolean(authenticatedCustomer.email_verified) : false,
      };

      const newOrder = {
        id: body.id || String(Math.floor(1000 + Math.random() * 9000)),
        customerId: finalCustomerId,
        customerEmail: finalCustomerEmail,
        customerSnapshot,
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        items: Array.isArray(items)
          ? items.map((it: any) => ({
              id: it.id,
              name: it.name,
              quantity: Number(it.quantity) || 1,
              price: Number(it.price) || 0,
              ...(it.recipientName ? { recipientName: String(it.recipientName).trim() } : {}),
            }))
          : [],
        subtotal,
        deliveryFee,
        discountAmount,
        couponCode: body.couponCode || undefined,
        totalAmount: calculatedTotal,
        status: body.status || "Pending",
        orderType: orderType || "Takeaway",
        tableNumber: body.tableNumber || undefined,
        paymentMethod: body.paymentMethod || "UPI / QR / Cash",
        paymentStatus: body.paymentStatus || "Pending",
        note: note || undefined,
        deliveryLocation: orderType === "Delivery" && deliveryLocation ? {
          lat: Number(deliveryLocation.lat),
          lng: Number(deliveryLocation.lng),
          building: String(deliveryLocation.building).trim(),
          room: deliveryLocation.room ? String(deliveryLocation.room).trim() : undefined,
          instructions: deliveryLocation.instructions ? String(deliveryLocation.instructions).trim() : undefined,
          formattedAddress: deliveryLocation.formattedAddress || `${String(deliveryLocation.building).trim()}, CSJMU Campus, Kalyanpur, Kanpur`,
          nearestLandmark: deliveryLocation.nearestLandmark || undefined,
          isVerifiedCampus: true,
        } : undefined,
        createdAt: body.createdAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: body.timestamp || Date.now(),
      };

      memoryOrders.unshift(newOrder);

      // Persist to Cloud Firestore if initialized
      const db = getAdminDb();
      if (db) {
        try {
          await db.collection("orders").doc(newOrder.id).set(cleanUndefined(newOrder));

          // Increment coupon usage count if coupon applied
          if (newOrder.couponCode) {
            const offerSnap = await db.collection("offers").where("code", "==", newOrder.couponCode.toUpperCase()).get();
            if (!offerSnap.empty) {
              const offerDoc = offerSnap.docs[0];
              await offerDoc.ref.update({
                usageCount: (offerDoc.data().usageCount || 0) + 1,
              });
            }
          }

          // Atomic inventory deduction for items with linked products
          if (Array.isArray(newOrder.items) && newOrder.items.length > 0) {
            for (const ordItem of newOrder.items) {
              const invSnap = await db.collection("inventory").where("linkedProductId", "==", ordItem.id).get();
              if (!invSnap.empty) {
                for (const invDoc of invSnap.docs) {
                  const invData = invDoc.data();
                  const currentQty = invData.quantity || 0;
                  const newQty = Math.max(0, currentQty - (ordItem.quantity || 1));
                  const threshold = invData.lowStockThreshold || 5;
                  let newStatus = "In Stock";
                  if (newQty <= 0) newStatus = "Out of Stock";
                  else if (newQty <= threshold) newStatus = "Low Stock";

                  await invDoc.ref.update({
                    quantity: newQty,
                    status: newStatus,
                    lastUpdated: Date.now(),
                  });

                  // If out of stock, automatically set menu item availability to false
                  if (newQty <= 0 && invData.linkedProductId) {
                    await db.collection("menu_items").doc(invData.linkedProductId).update({
                      isAvailable: false,
                    }).catch(() => {});
                  }
                }
              }
            }
          }
        } catch (dbErr) {
          console.warn("Could not write order to Firestore:", dbErr);
        }
      }

      return res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Order placement failed" });
    }
  }

  // Allow customers to retrieve their own orders by customerId
  if (req.method === "GET" && req.query?.customerId) {
    const customerId = String(req.query.customerId).trim();
    const db = getAdminDb();
    if (db) {
      try {
        const snap = await db.collection("orders").where("customerId", "==", customerId).get();
        const orders: any[] = [];
        snap.forEach((doc: any) => orders.push(doc.data()));
        orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        return res.status(200).json({ success: true, orders, totalCount: orders.length });
      } catch {}
    }
    const filtered = memoryOrders.filter((o) => o.customerId === customerId);
    return res.status(200).json({ success: true, orders: filtered, totalCount: filtered.length });
  }

  // All other methods (admin GET, PATCH, PUT, DELETE) require admin authentication
  const token = extractAuthToken(req);
  const auth = verifyToken(token);

  if (!auth.valid) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Admin authorization required to access order management.",
    });
  }

  // GET: Protected order stream for admin dashboard
  if (req.method === "GET") {
    const db = getAdminDb();
    if (db) {
      try {
        const snap = await db.collection("orders").orderBy("timestamp", "desc").get();
        const firestoreOrders: any[] = [];
        snap.forEach((doc: any) => firestoreOrders.push(doc.data()));
        return res.status(200).json({
          success: true,
          orders: firestoreOrders,
          totalCount: firestoreOrders.length,
        });
      } catch {}
    }

    return res.status(200).json({
      success: true,
      orders: memoryOrders,
      totalCount: memoryOrders.length,
    });
  }

  // PATCH / PUT: Update order status or payment status
  if (req.method === "PATCH" || req.method === "PUT") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const orderId = body.id || req.query?.id;
      const status = body.status;
      const paymentStatus = body.paymentStatus;

      if (!orderId) {
        return res.status(400).json({ success: false, error: "Order ID is required." });
      }

      const updates: any = { updatedAt: Date.now() };
      if (status) updates.status = status;
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      if (body.note !== undefined) updates.note = body.note;

      const existingIndex = memoryOrders.findIndex((o) => o.id === orderId);
      if (existingIndex >= 0) {
        memoryOrders[existingIndex] = { ...memoryOrders[existingIndex], ...updates };
      } else {
        memoryOrders.unshift({ id: orderId, ...updates });
      }

      const db = getAdminDb();
      if (db) {
        try {
          await db.collection("orders").doc(orderId).set(cleanUndefined(updates), { merge: true });
        } catch {}
      }

      return res.status(200).json({
        success: true,
        order: existingIndex >= 0 ? memoryOrders[existingIndex] : { id: orderId, ...updates },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Update failed" });
    }
  }

  // DELETE: Remove an order
  if (req.method === "DELETE") {
    const orderId = req.query?.id || (typeof req.body === "object" ? req.body?.id : null);
    if (!orderId) return res.status(400).json({ success: false, error: "Order ID required" });
    memoryOrders = memoryOrders.filter((o) => o.id !== orderId);

    const db = getAdminDb();
    if (db) {
      try {
        await db.collection("orders").doc(orderId).delete();
      } catch {}
    }

    return res.status(200).json({ success: true, deletedId: orderId });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

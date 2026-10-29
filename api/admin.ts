import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";
import { getAdminDb } from "./_lib/firebaseAdmin.ts";

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

  const db = getAdminDb();
  if (!db) {
    return res.status(500).json({ success: false, error: "Database connection unavailable" });
  }

  const action = req.query?.action || (typeof req.body === "object" ? req.body?.action : null);

  // -------------------------------------------------------------
  // Public Endpoint: Approved Customer Reviews for Website
  // -------------------------------------------------------------
  if (req.method === "GET" && action === "public_reviews") {
    try {
      const snap = await db.collection("reviews").where("status", "==", "approved").get();
      const reviews: any[] = [];
      snap.forEach((doc: any) => reviews.push(doc.data()));
      reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return res.status(200).json({ success: true, reviews });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // -------------------------------------------------------------
  // Public Endpoint: Validate Coupon for Checkout
  // -------------------------------------------------------------
  if ((req.method === "GET" || req.method === "POST") && action === "validate_coupon") {
    try {
      const code = String(req.query?.code || req.body?.code || "").trim().toUpperCase();
      const subtotal = Number(req.query?.subtotal || req.body?.subtotal || 0);

      if (!code) {
        return res.status(400).json({ success: false, error: "Please enter a coupon code" });
      }

      const snap = await db.collection("offers").where("code", "==", code).where("isActive", "==", true).get();
      if (snap.empty) {
        return res.status(404).json({ success: false, error: "Invalid or inactive promo code" });
      }

      const offer = snap.docs[0].data();
      if (offer.minOrderAmount && subtotal < offer.minOrderAmount) {
        return res.status(400).json({
          success: false,
          error: `Order subtotal must be at least ₹${offer.minOrderAmount} to apply code ${code}`,
        });
      }

      let discountAmount = 0;
      if (offer.discountType === "percentage") {
        discountAmount = Math.round((subtotal * (offer.discountValue || 0)) / 100);
        if (offer.maxDiscount && discountAmount > offer.maxDiscount) {
          discountAmount = offer.maxDiscount;
        }
      } else {
        discountAmount = Math.min(offer.discountValue || 0, subtotal);
      }

      return res.status(200).json({
        success: true,
        coupon: {
          id: offer.id,
          code: offer.code,
          title: offer.title,
          discountAmount,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // -------------------------------------------------------------
  // Public Endpoint: Submit Customer Review
  // -------------------------------------------------------------
  if (req.method === "POST" && action === "submit_review") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { customerName, rating, comment, customerId, targetType, targetId } = body;

      if (!customerName || !rating || !comment) {
        return res.status(400).json({ success: false, error: "Missing required review fields" });
      }

      const newReview = {
        id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        customerId: customerId || undefined,
        customerName: String(customerName).trim(),
        rating: Math.max(1, Math.min(5, Number(rating))),
        comment: String(comment).trim(),
        targetType: targetType || "cafe",
        targetId: targetId || undefined,
        status: "pending", // Requires admin moderation
        createdAt: Date.now(),
      };

      await db.collection("reviews").doc(newReview.id).set(cleanUndefined(newReview));
      return res.status(201).json({ success: true, review: newReview });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // =============================================================
  // ALL REMAINING ACTIONS REQUIRE AUTHORIZED ADMIN SESSION TOKEN
  // =============================================================
  const token = extractAuthToken(req);
  const auth = verifyToken(token);

  if (!auth.valid) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Administrator token is required or expired.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // -----------------------------------------------------------
    // 1. Dashboard Aggregated Statistics
    // -----------------------------------------------------------
    if (action === "stats" || (req.method === "GET" && !action)) {
      // Real Orders
      const ordersSnap = await db.collection("orders").orderBy("timestamp", "desc").get();
      const allOrders: any[] = [];
      let totalRevenue = 0;
      let pendingOrders = 0;
      let completedOrders = 0;
      const productCounts: Record<string, { id: string; name: string; count: number; revenue: number }> = {};

      ordersSnap.forEach((doc: any) => {
        const o = doc.data();
        allOrders.push(o);

        // Revenue: count all non-cancelled orders
        if (o.status !== "Cancelled") {
          totalRevenue += Number(o.totalAmount) || 0;
        }

        if (o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing") {
          pendingOrders++;
        }
        if (o.status === "Completed") {
          completedOrders++;
        }

        // Tally items
        if (Array.isArray(o.items)) {
          for (const item of o.items) {
            const id = item.id || item.name;
            if (!productCounts[id]) {
              productCounts[id] = { id, name: item.name, count: 0, revenue: 0 };
            }
            productCounts[id].count += Number(item.quantity) || 1;
            productCounts[id].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
          }
        }
      });

      // Best-selling products ranked by quantity
      const bestSellers = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Registered Customers
      const usersSnap = await db.collection("users").get();
      const totalCustomers = usersSnap.size;

      // Menu Items Count
      const menuSnap = await db.collection("menu_items").get();
      const totalMenuItems = menuSnap.size;
      let availableMenuItems = 0;
      menuSnap.forEach((doc: any) => {
        if (doc.data().isAvailable !== false) availableMenuItems++;
      });

      // Inventory Alerts
      const invSnap = await db.collection("inventory").get();
      let lowStockCount = 0;
      let outOfStockCount = 0;
      invSnap.forEach((doc: any) => {
        const item = doc.data();
        if (item.quantity <= 0 || item.status === "Out of Stock") {
          outOfStockCount++;
        } else if (item.quantity <= (item.lowStockThreshold || 5) || item.status === "Low Stock") {
          lowStockCount++;
        }
      });

      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders: allOrders.length,
          pendingOrders,
          completedOrders,
          totalCustomers,
          totalMenuItems,
          availableMenuItems,
          lowStockCount,
          outOfStockCount,
          bestSellers,
          recentOrders: allOrders.slice(0, 6),
        },
      });
    }

    // -----------------------------------------------------------
    // 2. Customers Management
    // -----------------------------------------------------------
    if (action === "customers") {
      const usersSnap = await db.collection("users").get();
      const ordersSnap = await db.collection("orders").get();

      // Index orders by customerId
      const ordersByCust: Record<string, any[]> = {};
      ordersSnap.forEach((doc: any) => {
        const o = doc.data();
        if (o.customerId) {
          if (!ordersByCust[o.customerId]) ordersByCust[o.customerId] = [];
          ordersByCust[o.customerId].push(o);
        }
      });

      const customers: any[] = [];
      usersSnap.forEach((doc: any) => {
        const u = doc.data();
        const custOrders = ordersByCust[u.uid] || [];
        const totalSpend = custOrders
          .filter((o) => o.status !== "Cancelled")
          .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

        customers.push({
          uid: u.uid,
          name: u.name || "Customer",
          email: u.email || "",
          phone: u.phone || "",
          role: u.role || "customer",
          createdAt: u.createdAt || null,
          defaultDeliveryLocation: u.defaultDeliveryLocation || null,
          totalOrders: custOrders.length,
          totalSpend,
          orders: custOrders.slice(0, 10), // latest 10
        });
      });

      customers.sort((a, b) => b.totalSpend - a.totalSpend);
      return res.status(200).json({ success: true, customers });
    }

    // -----------------------------------------------------------
    // 3. Inventory Management
    // -----------------------------------------------------------
    if (action === "inventory") {
      if (req.method === "GET") {
        const snap = await db.collection("inventory").get();
        const items: any[] = [];
        snap.forEach((doc: any) => items.push(doc.data()));
        items.sort((a, b) => a.name.localeCompare(b.name));
        return res.status(200).json({ success: true, items });
      }

      if (req.method === "POST") {
        const item = body.item || body;
        const id = item.id || `inv-${Date.now()}`;
        const qty = Number(item.quantity) || 0;
        const threshold = Number(item.lowStockThreshold) || 5;

        let status = "In Stock";
        if (qty <= 0) status = "Out of Stock";
        else if (qty <= threshold) status = "Low Stock";

        const fullItem = {
          ...item,
          id,
          quantity: qty,
          lowStockThreshold: threshold,
          status,
          lastUpdated: Date.now(),
        };

        await db.collection("inventory").doc(id).set(cleanUndefined(fullItem));
        return res.status(201).json({ success: true, item: fullItem });
      }

      if (req.method === "PUT" || req.method === "PATCH") {
        const item = body.item || body;
        const id = item.id || req.query?.id;
        if (!id) return res.status(400).json({ success: false, error: "Inventory item ID required" });

        // Handle quick delta adjustment if requested
        if (typeof body.delta === "number") {
          const docSnap = await db.collection("inventory").doc(id).get();
          if (!docSnap.exists) return res.status(404).json({ success: false, error: "Item not found" });
          const current = docSnap.data();
          const newQty = Math.max(0, (current.quantity || 0) + body.delta);
          const threshold = current.lowStockThreshold || 5;
          let newStatus = "In Stock";
          if (newQty <= 0) newStatus = "Out of Stock";
          else if (newQty <= threshold) newStatus = "Low Stock";

          const update = { quantity: newQty, status: newStatus, lastUpdated: Date.now() };
          await db.collection("inventory").doc(id).update(update);
          return res.status(200).json({ success: true, item: { ...current, ...update } });
        }

        const qty = Number(item.quantity) || 0;
        const threshold = Number(item.lowStockThreshold) || 5;
        let status = "In Stock";
        if (qty <= 0) status = "Out of Stock";
        else if (qty <= threshold) status = "Low Stock";

        const updateData = {
          ...item,
          quantity: qty,
          lowStockThreshold: threshold,
          status,
          lastUpdated: Date.now(),
        };

        await db.collection("inventory").doc(id).set(cleanUndefined(updateData), { merge: true });
        return res.status(200).json({ success: true, item: updateData });
      }

      if (req.method === "DELETE") {
        const id = req.query?.id || body?.id;
        if (!id) return res.status(400).json({ success: false, error: "Inventory item ID required" });
        await db.collection("inventory").doc(id).delete();
        return res.status(200).json({ success: true, deletedId: id });
      }
    }

    // -----------------------------------------------------------
    // 4. Reviews & Ratings Moderation
    // -----------------------------------------------------------
    if (action === "reviews") {
      if (req.method === "GET") {
        const snap = await db.collection("reviews").get();
        const reviews: any[] = [];
        snap.forEach((doc: any) => reviews.push(doc.data()));
        reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return res.status(200).json({ success: true, reviews });
      }

      if (req.method === "PUT" || req.method === "PATCH") {
        const reviewId = body.id || req.query?.id;
        const status = body.status; // "approved" | "rejected" | "pending"
        if (!reviewId || !status) {
          return res.status(400).json({ success: false, error: "Review ID and status are required" });
        }
        await db.collection("reviews").doc(reviewId).update({ status, moderatedAt: Date.now() });
        return res.status(200).json({ success: true, reviewId, status });
      }

      if (req.method === "DELETE") {
        const id = req.query?.id || body?.id;
        if (!id) return res.status(400).json({ success: false, error: "Review ID required" });
        await db.collection("reviews").doc(id).delete();
        return res.status(200).json({ success: true, deletedId: id });
      }
    }

    // -----------------------------------------------------------
    // 5. Offers & Promotions
    // -----------------------------------------------------------
    if (action === "offers") {
      if (req.method === "GET") {
        const snap = await db.collection("offers").get();
        const offers: any[] = [];
        snap.forEach((doc: any) => offers.push(doc.data()));
        offers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return res.status(200).json({ success: true, offers });
      }

      if (req.method === "POST") {
        const offer = body.offer || body;
        const code = String(offer.code || "").trim().toUpperCase();
        if (!code) return res.status(400).json({ success: false, error: "Coupon code is required" });

        const id = offer.id || `offer-${code.toLowerCase()}`;
        const newOffer = {
          ...offer,
          id,
          code,
          isActive: offer.isActive !== false,
          discountValue: Number(offer.discountValue) || 0,
          minOrderAmount: Number(offer.minOrderAmount) || 0,
          usageCount: 0,
          createdAt: Date.now(),
        };

        await db.collection("offers").doc(id).set(cleanUndefined(newOffer));
        return res.status(201).json({ success: true, offer: newOffer });
      }

      if (req.method === "PUT" || req.method === "PATCH") {
        const offer = body.offer || body;
        const id = offer.id || req.query?.id;
        if (!id) return res.status(400).json({ success: false, error: "Offer ID required" });

        await db.collection("offers").doc(id).set(cleanUndefined(offer), { merge: true });
        return res.status(200).json({ success: true, offer });
      }

      if (req.method === "DELETE") {
        const id = req.query?.id || body?.id;
        if (!id) return res.status(400).json({ success: false, error: "Offer ID required" });
        await db.collection("offers").doc(id).delete();
        return res.status(200).json({ success: true, deletedId: id });
      }
    }

    // -----------------------------------------------------------
    // 6. Settings Documents (store, featured, homepage, gifting)
    // -----------------------------------------------------------
    if (action === "settings") {
      const type = req.query?.type || body?.type || "store";

      if (req.method === "GET") {
        const docSnap = await db.collection("settings").doc(type).get();
        return res.status(200).json({
          success: true,
          data: docSnap.exists ? docSnap.data() : null,
        });
      }

      if (req.method === "POST" || req.method === "PUT") {
        const payload = body.data || body;
        await db.collection("settings").doc(type).set(cleanUndefined({ ...payload, updatedAt: Date.now() }), { merge: true });
        return res.status(200).json({ success: true, type, data: payload });
      }
    }

    // -----------------------------------------------------------
    // 7. Table Bookings / Reservations
    // -----------------------------------------------------------
    if (action === "reservations") {
      if (req.method === "GET") {
        const snap = await db.collection("reservations").orderBy("createdAt", "desc").get();
        const reservations: any[] = [];
        snap.forEach((doc: any) => reservations.push(doc.data()));
        return res.status(200).json({ success: true, reservations });
      }

      if (req.method === "POST") {
        const item = body.reservation || body;
        const id = item.id || `R-${Math.floor(100 + Math.random() * 900)}`;
        const record = {
          ...item,
          id,
          status: item.status || "Pending",
          createdAt: Date.now(),
        };
        await db.collection("reservations").doc(id).set(cleanUndefined(record));
        return res.status(201).json({ success: true, reservation: record });
      }

      if (req.method === "PATCH" || req.method === "PUT") {
        const id = body.id || req.query?.id;
        const status = body.status;
        if (!id || !status) return res.status(400).json({ success: false, error: "ID and status required" });
        await db.collection("reservations").doc(id).update({ status });
        return res.status(200).json({ success: true, id, status });
      }

      if (req.method === "DELETE") {
        const id = req.query?.id || body?.id;
        if (!id) return res.status(400).json({ success: false, error: "Reservation ID required" });
        await db.collection("reservations").doc(id).delete();
        return res.status(200).json({ success: true, deletedId: id });
      }
    }

    return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Admin operation failed" });
  }
}

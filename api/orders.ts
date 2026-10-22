import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";
import { isPointInCampusBoundary } from "./_lib/campusBoundary.ts";

let memoryOrders: any[] = [];

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

      const newOrder = {
        id: body.id || String(Math.floor(1000 + Math.random() * 9000)),
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        items: Array.isArray(items) ? items : [],
        totalAmount: Number(totalAmount) || 0,
        status: body.status || "Pending",
        orderType: orderType || "Takeaway",
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
        timestamp: Date.now(),
      };

      memoryOrders.unshift(newOrder);
      return res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Order placement failed" });
    }
  }

  // All other methods (GET, PATCH, PUT, DELETE) require admin authentication
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
    return res.status(200).json({
      success: true,
      orders: memoryOrders,
      totalCount: memoryOrders.length,
    });
  }

  // PATCH / PUT: Update order status
  if (req.method === "PATCH" || req.method === "PUT") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const orderId = body.id || req.query?.id;
      const status = body.status;

      if (!orderId) {
        return res.status(400).json({ success: false, error: "Order ID is required." });
      }

      const existingIndex = memoryOrders.findIndex((o) => o.id === orderId);
      if (existingIndex >= 0) {
        memoryOrders[existingIndex] = { ...memoryOrders[existingIndex], ...body };
        return res.status(200).json({ success: true, order: memoryOrders[existingIndex] });
      }

      // If not yet in memory, create placeholder
      const placeholder = { id: orderId, status: status || "Confirmed", updatedAt: Date.now() };
      memoryOrders.unshift(placeholder);
      return res.status(200).json({ success: true, order: placeholder });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Update failed" });
    }
  }

  // DELETE: Remove an order
  if (req.method === "DELETE") {
    const orderId = req.query?.id || (typeof req.body === "object" ? req.body?.id : null);
    if (!orderId) return res.status(400).json({ success: false, error: "Order ID required" });
    memoryOrders = memoryOrders.filter((o) => o.id !== orderId);
    return res.status(200).json({ success: true, deletedId: orderId });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

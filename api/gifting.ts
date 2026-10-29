import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";
import { getAdminDb } from "./_lib/firebaseAdmin.ts";

let memoryGifts: any[] = [];
let memoryGiftOrders: any[] = [];

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const db = getAdminDb();

  // GET: Public gift catalogue or protected gift orders
  if (req.method === "GET") {
    const type = req.query?.type;
    if (type === "orders") {
      // Viewing gift orders requires authentication
      const token = extractAuthToken(req);
      const auth = verifyToken(token);
      if (!auth.valid) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (db) {
        try {
          const snap = await db.collection("gifting_orders").orderBy("timestamp", "desc").get();
          const orders: any[] = [];
          snap.forEach((doc: any) => orders.push(doc.data()));
          if (orders.length > 0) {
            return res.status(200).json({ success: true, orders });
          }
        } catch {}
      }

      return res.status(200).json({ success: true, orders: memoryGiftOrders });
    }

    // Gift catalogue
    if (db) {
      try {
        const snap = await db.collection("gifting_products").get();
        if (!snap.empty) {
          const items: any[] = [];
          snap.forEach((doc: any) => items.push(doc.data()));
          return res.status(200).json({ success: true, items });
        }
      } catch {}
    }

    return res.status(200).json({
      success: true,
      items: memoryGifts,
    });
  }

  // POST: either public gift order placement or admin catalogue mutation
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    if (body.action === "place_gift_order") {
      const order = {
        id: `GIFT-${Math.floor(700 + Math.random() * 200)}`,
        ...body.order,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now(),
      };
      memoryGiftOrders.unshift(order);

      if (db) {
        try {
          await db.collection("gifting_orders").doc(order.id).set(order);
        } catch {}
      }

      return res.status(201).json({ success: true, order });
    }

    // Mutations require admin authentication
    const token = extractAuthToken(req);
    const auth = verifyToken(token);

    if (!auth.valid) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Admin authorization required to modify gifting catalogue.",
      });
    }

    if (req.method === "POST") {
      if (Array.isArray(body.items)) {
        memoryGifts = body.items;
        if (db) {
          try {
            const batch = db.batch();
            for (const it of body.items) {
              const id = it.id || `gift-${Date.now()}`;
              batch.set(db.collection("gifting_products").doc(id), { ...it, id }, { merge: true });
            }
            await batch.commit();
          } catch {}
        }
        return res.status(200).json({ success: true, count: memoryGifts.length });
      }
      if (body.item) {
        const item = { ...body.item, id: body.item.id || `gift-${Date.now()}` };
        memoryGifts.push(item);
        if (db) {
          try {
            await db.collection("gifting_products").doc(item.id).set(item);
          } catch {}
        }
        return res.status(201).json({ success: true, item });
      }
    }

    if (req.method === "PUT") {
      const updatedItem = body.item || body;
      const idx = memoryGifts.findIndex((i) => i.id === updatedItem.id);
      if (idx >= 0) {
        memoryGifts[idx] = { ...memoryGifts[idx], ...updatedItem };
      } else {
        memoryGifts.push(updatedItem);
      }

      if (db && updatedItem.id) {
        try {
          await db.collection("gifting_products").doc(updatedItem.id).set(updatedItem, { merge: true });
        } catch {}
      }

      return res.status(200).json({ success: true, item: updatedItem });
    }

    if (req.method === "DELETE") {
      const id = req.query?.id || body?.id;
      memoryGifts = memoryGifts.filter((i) => i.id !== id);

      if (db && id) {
        try {
          await db.collection("gifting_products").doc(id).delete();
        } catch {}
      }

      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
}

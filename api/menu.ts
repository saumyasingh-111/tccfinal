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

let memoryMenuItems: any[] = [];
let memoryCategories: any[] = [];

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const isCategories = req.query?.type === "categories";
  const db = getAdminDb();

  // -------------------------------------------------------------
  // GET: Public menu list or categories list
  // -------------------------------------------------------------
  if (req.method === "GET") {
    if (isCategories) {
      if (db) {
        try {
          const snap = await db.collection("categories").orderBy("sortOrder", "asc").get();
          if (!snap.empty) {
            const categories: any[] = [];
            snap.forEach((doc: any) => categories.push(doc.data()));
            return res.status(200).json({ success: true, categories, source: "firestore" });
          }
        } catch (err) {
          console.warn("Firestore categories read error:", err);
        }
      }
      return res.status(200).json({ success: true, categories: memoryCategories });
    }

    // Default: menu items
    if (db) {
      try {
        const snap = await db.collection("menu_items").get();
        if (!snap.empty) {
          const items: any[] = [];
          snap.forEach((doc: any) => items.push(doc.data()));
          return res.status(200).json({ success: true, items, source: "firestore" });
        }
      } catch (err) {
        console.warn("Firestore menu read error:", err);
      }
    }

    return res.status(200).json({
      success: true,
      items: memoryMenuItems,
      source: memoryMenuItems.length > 0 ? "server" : "initial",
    });
  }

  // -------------------------------------------------------------
  // Mutations require admin authentication
  // -------------------------------------------------------------
  const token = extractAuthToken(req);
  const auth = verifyToken(token);

  if (!auth.valid) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Admin authorization token required to modify menu or categories.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // ----------------- Category Mutations -----------------
    if (isCategories) {
      if (req.method === "POST") {
        if (Array.isArray(body.categories)) {
          memoryCategories = body.categories;
          if (db) {
            const batch = db.batch();
            for (const cat of body.categories) {
              const id = cat.id;
              batch.set(db.collection("categories").doc(id), cleanUndefined({ ...cat, updatedAt: Date.now() }), { merge: true });
            }
            await batch.commit();
          }
          return res.status(200).json({ success: true, count: body.categories.length });
        }
        if (body.category) {
          const cat = body.category;
          memoryCategories.push(cat);
          if (db) {
            await db.collection("categories").doc(cat.id).set(cleanUndefined({ ...cat, updatedAt: Date.now() }), { merge: true });
          }
          return res.status(201).json({ success: true, category: cat });
        }
      }

      if (req.method === "PUT") {
        const cat = body.category || body;
        if (db && cat.id) {
          await db.collection("categories").doc(cat.id).set(cleanUndefined({ ...cat, updatedAt: Date.now() }), { merge: true });
        }
        const idx = memoryCategories.findIndex((c) => c.id === cat.id);
        if (idx >= 0) memoryCategories[idx] = cat;
        else memoryCategories.push(cat);
        return res.status(200).json({ success: true, category: cat });
      }

      if (req.method === "DELETE") {
        const id = req.query?.id || body?.id;
        if (!id) return res.status(400).json({ success: false, error: "Category ID required" });
        if (db) {
          await db.collection("categories").doc(id).delete();
        }
        memoryCategories = memoryCategories.filter((c) => c.id !== id);
        return res.status(200).json({ success: true, deletedId: id });
      }
    }

    // ----------------- Menu Items Mutations -----------------
    if (req.method === "POST") {
      if (Array.isArray(body.items)) {
        memoryMenuItems = body.items;
        if (db) {
          const batch = db.batch();
          for (const it of body.items) {
            const id = it.id || `item-${Date.now()}`;
            batch.set(db.collection("menu_items").doc(id), cleanUndefined({ ...it, id, updatedAt: Date.now() }), { merge: true });
          }
          await batch.commit();
        }
        return res.status(200).json({ success: true, count: memoryMenuItems.length });
      }
      if (body.item) {
        const newItem = { ...body.item, id: body.item.id || `item-${Date.now()}`, updatedAt: Date.now() };
        memoryMenuItems.push(newItem);
        if (db) {
          await db.collection("menu_items").doc(newItem.id).set(cleanUndefined(newItem));
        }
        return res.status(201).json({ success: true, item: newItem });
      }
      return res.status(400).json({ success: false, error: "Missing item data" });
    }

    if (req.method === "PUT") {
      const updatedItem = body.item || body;
      const idx = memoryMenuItems.findIndex((i) => i.id === updatedItem.id);
      if (idx >= 0) {
        memoryMenuItems[idx] = { ...memoryMenuItems[idx], ...updatedItem, updatedAt: Date.now() };
      } else {
        memoryMenuItems.push({ ...updatedItem, updatedAt: Date.now() });
      }

      if (db && updatedItem.id) {
        await db.collection("menu_items").doc(updatedItem.id).set(cleanUndefined({ ...updatedItem, updatedAt: Date.now() }), { merge: true });
      }

      return res.status(200).json({ success: true, item: updatedItem });
    }

    if (req.method === "DELETE") {
      const id = req.query?.id || body?.id;
      if (!id) return res.status(400).json({ success: false, error: "Item ID required" });
      memoryMenuItems = memoryMenuItems.filter((i) => i.id !== id);

      if (db) {
        await db.collection("menu_items").doc(id).delete();
      }

      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
}

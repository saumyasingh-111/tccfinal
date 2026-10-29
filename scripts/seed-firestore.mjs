import { getAdminDb } from "../api/_lib/firebaseAdmin.ts";
import { MENU_ITEMS, MENU_CATEGORIES } from "../src/data/menuData.ts";
import {
  GIFT_PRODUCTS,
  GIFT_CATEGORIES,
  GIFT_ADDONS,
  DEFAULT_GIFTING_SETTINGS,
} from "../src/data/giftingData.ts";
import { CAFE_CONFIG } from "../src/data/cafeConfig.ts";
import { IMAGES } from "../src/data/images.ts";

function cleanUndefined(obj) {
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

export async function seedFirestore(force = false) {
  const db = getAdminDb();
  if (!db) {
    throw new Error("Could not initialize Firestore Admin DB");
  }

  console.log("Checking Firestore collections for initial seeding...");

  // 1. Menu Items
  const menuSnap = await db.collection("menu_items").limit(1).get();
  if (menuSnap.empty || force) {
    console.log(`Seeding ${MENU_ITEMS.length} menu items...`);
    const batch = db.batch();
    for (const item of MENU_ITEMS) {
      const docRef = db.collection("menu_items").doc(item.id);
      batch.set(
        docRef,
        cleanUndefined({
          ...item,
          isAvailable: item.isAvailable !== false,
          isVegetarian: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
        { merge: true }
      );
    }
    await batch.commit();
    console.log("✓ Menu items seeded.");
  } else {
    console.log("• menu_items already populated.");
  }

  // 2. Menu Categories
  const catSnap = await db.collection("categories").limit(1).get();
  if (catSnap.empty || force) {
    console.log(`Seeding ${MENU_CATEGORIES.length} categories...`);
    const batch = db.batch();
    for (let i = 0; i < MENU_CATEGORIES.length; i++) {
      const cat = MENU_CATEGORIES[i];
      const docRef = db.collection("categories").doc(cat.id);
      batch.set(
        docRef,
        cleanUndefined({
          ...cat,
          sortOrder: i + 1,
          isActive: true,
          updatedAt: Date.now(),
        }),
        { merge: true }
      );
    }
    await batch.commit();
    console.log("✓ Categories seeded.");
  } else {
    console.log("• categories already populated.");
  }

  // 3. Inventory Items
  const invSnap = await db.collection("inventory").limit(1).get();
  if (invSnap.empty || force) {
    console.log("Seeding initial inventory items...");
    const initialInventory = [
      {
        id: "inv-coffee-beans",
        name: "Arabica Roasted Coffee Beans",
        category: "Beverages",
        linkedProductId: "cold-coffee",
        quantity: 25,
        unit: "kg",
        lowStockThreshold: 5,
        status: "In Stock",
        lastUpdated: Date.now(),
      },
      {
        id: "inv-sandwich-bread",
        name: "Multigrain Jumbo Sandwich Bread",
        category: "Baking",
        linkedProductId: "cheese-sandwich",
        quantity: 40,
        unit: "loaves",
        lowStockThreshold: 10,
        status: "In Stock",
        lastUpdated: Date.now(),
      },
      {
        id: "inv-chocolate-ganache",
        name: "Belgian Dark Chocolate Ganache",
        category: "Baking",
        linkedProductId: "dark-and-white-delight",
        quantity: 18,
        unit: "kg",
        lowStockThreshold: 4,
        status: "In Stock",
        lastUpdated: Date.now(),
      },
      {
        id: "inv-mozzarella-cheese",
        name: "Diced Mozzarella & Cheddar Blend",
        category: "Dairy",
        linkedProductId: "paneer-pizza",
        quantity: 30,
        unit: "kg",
        lowStockThreshold: 8,
        status: "In Stock",
        lastUpdated: Date.now(),
      },
      {
        id: "inv-french-fries",
        name: "Crispy Potato French Fries (Frozen)",
        category: "Kitchen",
        linkedProductId: "peri-peri-fries",
        quantity: 15,
        unit: "kg",
        lowStockThreshold: 6,
        status: "In Stock",
        lastUpdated: Date.now(),
      },
      {
        id: "inv-paneer-cubes",
        name: "Fresh Malai Paneer",
        category: "Dairy",
        linkedProductId: "paneer-pizza",
        quantity: 12,
        unit: "kg",
        lowStockThreshold: 3,
        status: "In Stock",
        lastUpdated: Date.now(),
      },
      {
        id: "inv-cups-takeaway",
        name: "Eco-Friendly Beverage Cups (350ml)",
        category: "Packaging",
        quantity: 250,
        unit: "pcs",
        lowStockThreshold: 50,
        status: "In Stock",
        lastUpdated: Date.now(),
      },
      {
        id: "inv-delivery-boxes",
        name: "TCC Kraft Paper Delivery Boxes",
        category: "Packaging",
        quantity: 180,
        unit: "pcs",
        lowStockThreshold: 30,
        status: "In Stock",
        lastUpdated: Date.now(),
      },
      {
        id: "inv-cheese-momos",
        name: "Handcrafted Steam Cheese Momos",
        category: "Kitchen",
        linkedProductId: "cheese-momos",
        quantity: 3,
        unit: "portions",
        lowStockThreshold: 5,
        status: "Low Stock",
        lastUpdated: Date.now(),
      },
    ];

    const batch = db.batch();
    for (const inv of initialInventory) {
      batch.set(db.collection("inventory").doc(inv.id), inv);
    }
    await batch.commit();
    console.log("✓ Inventory seeded.");
  } else {
    console.log("• inventory already populated.");
  }

  // 4. Settings
  const settingsSnap = await db.collection("settings").doc("store").get();
  if (!settingsSnap.exists || force) {
    console.log("Seeding cafe store settings...");
    await db.collection("settings").doc("store").set(cleanUndefined({
      ...CAFE_CONFIG,
      isMaintenanceMode: false,
      acceptingOrders: true,
      minOrderAmount: 0,
      deliveryFee: 40,
      updatedAt: Date.now(),
    }));

    await db.collection("settings").doc("featured").set({
      itemIds: ["dark-and-white-delight", "paneer-pizza", "cheese-sandwich", "cold-coffee"],
      updatedAt: Date.now(),
    });

    await db.collection("settings").doc("homepage").set({
      heroTitle: "THE CLASSIC CRUSH",
      heroSubtitle: "BAKERY & CAFE",
      heroDescription: "Freshly made. Comfortingly familiar.",
      heroImage: "/hero-indian-cafe.jpg",
      storyHeading: "Made for good food & good company.",
      storyDescription:
        "We created The Classic Crush for anyone looking for genuinely delicious bakery treats and hearty savory bites without pretentious dining prices. From steaming morning chai and flaky patties to midnight chocolate cravings with college friends.",
      storyImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80",
      updatedAt: Date.now(),
    });

    await db.collection("settings").doc("gifting").set({
      ...DEFAULT_GIFTING_SETTINGS,
      updatedAt: Date.now(),
    });

    console.log("✓ Settings seeded.");
  } else {
    console.log("• settings already populated.");
  }

  // 5. Gifting Products & Catalogue
  const giftSnap = await db.collection("gifting_products").limit(1).get();
  if (giftSnap.empty || force) {
    console.log("Seeding gifting products, categories, and add-ons...");
    const batch = db.batch();
    for (const gp of GIFT_PRODUCTS) {
      batch.set(db.collection("gifting_products").doc(gp.id), cleanUndefined(gp));
    }
    for (const gc of GIFT_CATEGORIES) {
      batch.set(db.collection("gifting_categories").doc(gc.id), cleanUndefined(gc));
    }
    for (const ga of GIFT_ADDONS) {
      batch.set(db.collection("gifting_addons").doc(ga.id), cleanUndefined(ga));
    }
    await batch.commit();
    console.log("✓ Gifting catalogue seeded.");
  } else {
    console.log("• gifting_products already populated.");
  }

  // 6. Gallery Items
  const galSnap = await db.collection("gallery").limit(1).get();
  if (galSnap.empty || force) {
    console.log("Seeding gallery items...");
    const batch = db.batch();
    for (let i = 0; i < IMAGES.gallery.length; i++) {
      const g = IMAGES.gallery[i];
      const id = `gal-${i + 1}`;
      batch.set(db.collection("gallery").doc(id), {
        id,
        url: g.url,
        caption: g.caption,
        category: g.category,
        aspect: g.aspect === "landscape" ? "landscape" : "portrait",
        isVisible: true,
        sortOrder: i + 1,
        createdAt: Date.now(),
      });
    }
    await batch.commit();
    console.log("✓ Gallery items seeded.");
  } else {
    console.log("• gallery already populated.");
  }

  // 7. Offers & Promotions
  const offersSnap = await db.collection("offers").limit(1).get();
  if (offersSnap.empty || force) {
    console.log("Seeding initial offers...");
    const initialOffers = [
      {
        id: "offer-welcome10",
        code: "WELCOME10",
        title: "Welcome Student Discount",
        description: "Get 10% off on all campus orders above ₹149",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 149,
        maxDiscount: 50,
        isActive: true,
        validUntil: "2027-12-31",
        usageCount: 14,
        createdAt: Date.now(),
      },
      {
        id: "offer-crush50",
        code: "CRUSH50",
        title: "Weekend Treat Discount",
        description: "Flat ₹50 off on treat orders above ₹299",
        discountType: "fixed",
        discountValue: 50,
        minOrderAmount: 299,
        isActive: true,
        validUntil: "2027-12-31",
        usageCount: 8,
        createdAt: Date.now(),
      },
    ];

    const batch = db.batch();
    for (const off of initialOffers) {
      batch.set(db.collection("offers").doc(off.id), off);
    }
    await batch.commit();
    console.log("✓ Offers seeded.");
  } else {
    console.log("• offers already populated.");
  }

  // 8. Reviews
  const reviewsSnap = await db.collection("reviews").limit(1).get();
  if (reviewsSnap.empty || force) {
    console.log("Seeding initial customer reviews...");
    const initialReviews = [
      {
        id: "rev-1",
        customerName: "Rahul Sharma",
        rating: 5,
        comment:
          "Best cold coffee and cheese sandwich in Kalyanpur! Perfect evening hangout right next to CSJMU campus.",
        targetType: "cafe",
        status: "approved",
        createdAt: Date.now() - 3 * 86400000,
      },
      {
        id: "rev-2",
        customerName: "Ananya Roy",
        rating: 5,
        comment:
          "The Dark & White Delight cake is pure bliss. Super fast hostel delivery too, warmly packaged!",
        targetType: "product",
        targetId: "dark-and-white-delight",
        status: "approved",
        createdAt: Date.now() - 2 * 86400000,
      },
      {
        id: "rev-3",
        customerName: "Priya Singh",
        rating: 5,
        comment:
          "Freshly baked cheese momos and flaky patties! Truly affordable prices without compromising on authentic taste.",
        targetType: "cafe",
        status: "approved",
        createdAt: Date.now() - 86400000,
      },
    ];

    const batch = db.batch();
    for (const r of initialReviews) {
      batch.set(db.collection("reviews").doc(r.id), r);
    }
    await batch.commit();
    console.log("✓ Reviews seeded.");
  } else {
    console.log("• reviews already populated.");
  }

  console.log("All collections verified and ready in Firestore!");
}

if (process.argv[1]?.endsWith("seed-firestore.mjs")) {
  seedFirestore(process.argv.includes("--force"))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}

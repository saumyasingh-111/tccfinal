import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MENU_ITEMS, MENU_CATEGORIES, type MenuItem, type MenuCategory } from "../data/menuData";
import { CAFE_CONFIG, type CafeConfig } from "../data/cafeConfig";
import { IMAGES } from "../data/images";
import {
  GIFT_PRODUCTS,
  GIFT_CATEGORIES,
  GIFT_ADDONS,
  DEFAULT_GIFTING_SETTINGS,
  type GiftProduct,
  type GiftCategory,
  type GiftAddon,
  type GiftingSettings,
  type GiftingOrderRecord,
  type GiftingOrderStatus,
} from "../data/giftingData";

import { type CampusDeliveryLocation } from "../data/campusBoundary";

export type {
  GiftProduct,
  GiftCategory,
  GiftAddon,
  GiftingSettings,
  GiftingOrderRecord,
  GiftingOrderStatus,
  CampusDeliveryLocation,
};

export type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type ReservationStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface OrderRecord {
  id: string; // e.g. "1042"
  customerId?: string;
  customerEmail?: string;
  customerName: string;
  customerPhone: string;
  items: { id: string; name: string; quantity: number; price: number; recipientName?: string }[];
  subtotal?: number;
  deliveryFee?: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  orderType: "Dine-in" | "Takeaway" | "Delivery";
  tableNumber?: string;
  note?: string;
  deliveryLocation?: CampusDeliveryLocation;
  paymentMethod?: "UPI / QR / Cash" | "Online" | string;
  paymentStatus?: "Pending" | "Paid" | "Failed" | "Refunded";
  timestamp?: number;
  customerSnapshot?: {
    uid?: string;
    name?: string;
    phone?: string;
    email?: string;
    isVerified?: boolean;
  };
}

export interface ReservationRecord {
  id: string;
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  status: ReservationStatus;
  note?: string;
  createdAt?: number;
}

export interface GalleryRecord {
  id: string;
  url: string;
  caption: string;
  category: string;
  aspect: "landscape" | "portrait";
  isVisible: boolean;
  sortOrder?: number;
}

export interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  storyHeading: string;
  storyDescription: string;
  storyImage: string;
}

export interface AdminSettings {
  email: string;
  passwordHash: string; // Plain / base64 for local admin demo
  isMaintenanceMode: boolean;
}

interface DataContextType {
  // Menu
  menuItems: MenuItem[];
  categories: MenuCategory[];
  addMenuItem: (item: Omit<MenuItem, "id"> & { id?: string }) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  duplicateMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;

  // Categories
  addCategory: (category: MenuCategory) => void;
  updateCategory: (category: MenuCategory) => void;
  deleteCategory: (id: string) => { success: boolean; message?: string };
  reorderCategories: (categories: MenuCategory[]) => void;

  // Featured
  featuredItemIds: string[];
  updateFeaturedItemIds: (ids: string[]) => void;
  toggleFeaturedItem: (id: string) => void;

  // Gallery
  galleryItems: GalleryRecord[];
  addGalleryItem: (item: Omit<GalleryRecord, "id">) => void;
  updateGalleryItem: (item: GalleryRecord) => void;
  deleteGalleryItem: (id: string) => void;
  toggleGalleryVisibility: (id: string) => void;

  // Homepage
  homepageContent: HomepageContent;
  updateHomepageContent: (content: Partial<HomepageContent>) => void;

  // Cafe Info
  cafeInfo: CafeConfig;
  updateCafeInfo: (info: Partial<CafeConfig>) => void;

  // Orders
  orders: OrderRecord[];
  addOrder: (order: Omit<OrderRecord, "id" | "createdAt">, idToken?: string) => OrderRecord;
  updateOrderStatus: (orderId: string, status: OrderStatus, paymentStatus?: OrderRecord["paymentStatus"]) => void;
  deleteOrder: (orderId: string) => void;

  // Reservations
  reservations: ReservationRecord[];
  addReservation: (reservation: Omit<ReservationRecord, "id">) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  deleteReservation: (id: string) => void;

  // Gifting Products
  giftProducts: GiftProduct[];
  addGiftProduct: (gift: Omit<GiftProduct, "id"> & { id?: string }) => void;
  updateGiftProduct: (gift: GiftProduct) => void;
  deleteGiftProduct: (id: string) => void;
  toggleGiftAvailability: (id: string) => void;

  // Gifting Categories
  giftCategories: GiftCategory[];
  addGiftCategory: (cat: GiftCategory) => void;
  updateGiftCategory: (cat: GiftCategory) => void;
  deleteGiftCategory: (id: string) => void;

  // Gifting Add-ons
  giftAddons: GiftAddon[];
  addGiftAddon: (addon: Omit<GiftAddon, "id"> & { id?: string }) => void;
  updateGiftAddon: (addon: GiftAddon) => void;
  deleteGiftAddon: (id: string) => void;
  toggleAddonAvailability: (id: string) => void;

  // Gifting Orders
  giftingOrders: GiftingOrderRecord[];
  addGiftingOrder: (order: Omit<GiftingOrderRecord, "id" | "createdAt">) => GiftingOrderRecord;
  updateGiftingOrderStatus: (orderId: string, status: GiftingOrderStatus) => void;
  deleteGiftingOrder: (orderId: string) => void;

  // Gifting Settings
  giftingSettings: GiftingSettings;
  updateGiftingSettings: (settings: Partial<GiftingSettings>) => void;

  // Settings
  settings: AdminSettings;
  updateSettings: (settings: Partial<AdminSettings>) => void;
  resetToDefaults: () => void;

  // Refresh
  refreshData: () => Promise<void>;
}

const STORAGE_KEY = "classic_crush_store_v4";

const initialGallery: GalleryRecord[] = IMAGES.gallery.map((g, idx) => ({
  id: `gal-${idx + 1}`,
  url: g.url,
  caption: g.caption,
  category: g.category,
  aspect: (g.aspect === "landscape" ? "landscape" : "portrait") as "landscape" | "portrait",
  isVisible: true,
}));

const initialHomepage: HomepageContent = {
  heroTitle: "THE CLASSIC CRUSH",
  heroSubtitle: "BAKERY & CAFE",
  heroDescription: "Freshly made. Comfortingly familiar.",
  heroImage: "/hero-indian-cafe.jpg",
  storyHeading: "Made for good food & good company.",
  storyDescription:
    "We created The Classic Crush for anyone looking for genuinely delicious bakery treats and hearty savory bites without pretentious dining prices. From steaming morning chai and flaky patties to midnight chocolate cravings with college friends.",
  storyImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80",
};

const initialSettings: AdminSettings = {
  email: "admin@theclassiccrush.com",
  passwordHash: "admin123",
  isMaintenanceMode: false,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_menu`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return MENU_ITEMS.map((item) => ({ ...item, isAvailable: item.isAvailable !== false }));
  });

  const [categories, setCategories] = useState<MenuCategory[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return MENU_CATEGORIES;
  });

  const [featuredItemIds, setFeaturedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_featured`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ["dark-and-white-delight", "paneer-pizza", "cheese-sandwich", "cold-coffee"];
  });

  const [galleryItems, setGalleryItems] = useState<GalleryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gallery`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialGallery;
  });

  const [homepageContent, setHomepageContent] = useState<HomepageContent>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_homepage`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialHomepage;
  });

  const [cafeInfo, setCafeInfo] = useState<CafeConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cafe_info`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return CAFE_CONFIG;
  });

  // Zero fake demo orders: initialize empty until fetched from Firestore!
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Zero fake demo reservations: initialize empty until fetched from Firestore!
  const [reservations, setReservations] = useState<ReservationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_reservations`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialSettings;
  });

  // Gifting state
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gift_products`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return GIFT_PRODUCTS;
  });

  const [giftCategories, setGiftCategories] = useState<GiftCategory[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gift_categories`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return GIFT_CATEGORIES;
  });

  const [giftAddons, setGiftAddons] = useState<GiftAddon[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gift_addons`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return GIFT_ADDONS;
  });

  const [giftingSettings, setGiftingSettings] = useState<GiftingSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gifting_settings`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_GIFTING_SETTINGS;
  });

  // Zero fake demo gift orders: initialize empty until fetched from Firestore!
  const [giftingOrders, setGiftingOrders] = useState<GiftingOrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gifting_orders`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Sync to LocalStorage on updates for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_menu`, JSON.stringify(menuItems));
    } catch {}
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_featured`, JSON.stringify(featuredItemIds));
    } catch {}
  }, [featuredItemIds]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_gallery`, JSON.stringify(galleryItems));
    } catch {}
  }, [galleryItems]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_homepage`, JSON.stringify(homepageContent));
    } catch {}
  }, [homepageContent]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_cafe_info`, JSON.stringify(cafeInfo));
    } catch {}
  }, [cafeInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_reservations`, JSON.stringify(reservations));
    } catch {}
  }, [reservations]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_gift_products`, JSON.stringify(giftProducts));
    } catch {}
  }, [giftProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_gift_categories`, JSON.stringify(giftCategories));
    } catch {}
  }, [giftCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_gift_addons`, JSON.stringify(giftAddons));
    } catch {}
  }, [giftAddons]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_gifting_settings`, JSON.stringify(giftingSettings));
    } catch {}
  }, [giftingSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_gifting_orders`, JSON.stringify(giftingOrders));
    } catch {}
  }, [giftingOrders]);

  // Auth token helper for authenticated API calls
  const getAuthToken = (): string | null => {
    try {
      return (
        sessionStorage.getItem("classic_crush_admin_session_token") ||
        localStorage.getItem("classic_crush_admin_session_token")
      );
    } catch {
      return null;
    }
  };

  // Centralized Refresh Function to load live Firestore data
  const refreshData = useCallback(async () => {
    // 1. Menu items
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setMenuItems(data.items);
        }
      }
    } catch {}

    // 2. Categories
    try {
      const res = await fetch("/api/menu?type=categories");
      if (res.ok) {
        const data = await res.json();
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch {}

    // 3. Featured items & settings
    try {
      const res = await fetch("/api/admin?action=settings&type=featured");
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.itemIds && Array.isArray(data.data.itemIds)) {
          setFeaturedItemIds(data.data.itemIds);
        }
      }
    } catch {}

    try {
      const res = await fetch("/api/admin?action=settings&type=homepage");
      if (res.ok) {
        const data = await res.json();
        if (data?.data) setHomepageContent(data.data);
      }
    } catch {}

    try {
      const res = await fetch("/api/admin?action=settings&type=store");
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          setCafeInfo(data.data);
          if (data.data.isMaintenanceMode !== undefined) {
            setSettings((prev) => ({ ...prev, isMaintenanceMode: !!data.data.isMaintenanceMode }));
          }
        }
      }
    } catch {}

    // 4. Authenticated data streams (Orders, Reservations, Gift orders)
    const token = getAuthToken();
    if (token) {
      try {
        const ordRes = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (Array.isArray(ordData?.orders)) {
            setOrders(ordData.orders);
          }
        }
      } catch {}

      try {
        const resRes = await fetch("/api/admin?action=reservations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resRes.ok) {
          const resData = await resRes.json();
          if (Array.isArray(resData?.reservations)) {
            setReservations(resData.reservations);
          }
        }
      } catch {}

      try {
        const giftRes = await fetch("/api/gifting?type=orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (giftRes.ok) {
          const giftData = await giftRes.json();
          if (Array.isArray(giftData?.orders)) {
            setGiftingOrders(giftData.orders);
          }
        }
      } catch {}
    }
  }, []);

  // Sync initial data from backend on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // MENU OPERATIONS
  const addMenuItem = (item: Omit<MenuItem, "id"> & { id?: string }) => {
    const newId =
      item.id ||
      item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
    const fullItem: MenuItem = {
      ...item,
      id: newId,
      isAvailable: item.isAvailable !== false,
      isVegetarian: true,
    };
    setMenuItems((prev) => [fullItem, ...prev]);

    const token = getAuthToken();
    if (token) {
      fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item: fullItem }),
      }).catch(() => {});
    }
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));

    const token = getAuthToken();
    if (token) {
      fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item }),
      }).catch(() => {});
    }
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
    setFeaturedItemIds((prev) => prev.filter((fid) => fid !== id));

    const token = getAuthToken();
    if (token) {
      fetch(`/api/menu?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const duplicateMenuItem = (id: string) => {
    const existing = menuItems.find((i) => i.id === id);
    if (!existing) return;
    const copy: MenuItem = {
      ...existing,
      id: `${existing.id}-copy-${Date.now().toString().slice(-3)}`,
      name: `${existing.name} (Copy)`,
      isBestseller: false,
      isFeatured: false,
    };
    addMenuItem(copy);
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const updated = { ...i, isAvailable: !(i.isAvailable !== false) };
          const token = getAuthToken();
          if (token) {
            fetch("/api/menu", {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ item: updated }),
            }).catch(() => {});
          }
          return updated;
        }
        return i;
      })
    );
  };

  // CATEGORY OPERATIONS
  const addCategory = (category: MenuCategory) => {
    setCategories((prev) => [...prev, category]);
    const token = getAuthToken();
    if (token) {
      fetch("/api/menu?type=categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category }),
      }).catch(() => {});
    }
  };

  const updateCategory = (category: MenuCategory) => {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
    const token = getAuthToken();
    if (token) {
      fetch("/api/menu?type=categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category }),
      }).catch(() => {});
    }
  };

  const deleteCategory = (id: string): { success: boolean; message?: string } => {
    if (id === "all") {
      return { success: false, message: "Cannot delete the default 'All' category." };
    }
    const hasItems = menuItems.some((item) => item.category === id);
    if (hasItems) {
      return {
        success: false,
        message: `Cannot delete this category because items are currently assigned to it. Please reassign or delete those items first.`,
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    const token = getAuthToken();
    if (token) {
      fetch(`/api/menu?type=categories&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    return { success: true };
  };

  const reorderCategories = (newOrder: MenuCategory[]) => {
    setCategories(newOrder);
    const token = getAuthToken();
    if (token) {
      fetch("/api/menu?type=categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categories: newOrder }),
      }).catch(() => {});
    }
  };

  // FEATURED ITEMS
  const updateFeaturedItemIds = (ids: string[]) => {
    setFeaturedItemIds(ids);
    const token = getAuthToken();
    if (token) {
      fetch("/api/admin?action=settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "featured", data: { itemIds: ids } }),
      }).catch(() => {});
    }
  };

  const toggleFeaturedItem = (id: string) => {
    setFeaturedItemIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((i) => i !== id);
      } else {
        if (prev.length >= 6) return prev;
        next = [...prev, id];
      }
      updateFeaturedItemIds(next);
      return next;
    });
  };

  // GALLERY OPERATIONS
  const addGalleryItem = (item: Omit<GalleryRecord, "id">) => {
    const newRecord: GalleryRecord = {
      ...item,
      id: `gal-${Date.now()}`,
    };
    setGalleryItems((prev) => [newRecord, ...prev]);
  };

  const updateGalleryItem = (item: GalleryRecord) => {
    setGalleryItems((prev) => prev.map((g) => (g.id === item.id ? item : g)));
  };

  const deleteGalleryItem = (id: string) => {
    setGalleryItems((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleGalleryVisibility = (id: string) => {
    setGalleryItems((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isVisible: !g.isVisible } : g))
    );
  };

  // HOMEPAGE
  const updateHomepageContent = (content: Partial<HomepageContent>) => {
    setHomepageContent((prev) => {
      const updated = { ...prev, ...content };
      const token = getAuthToken();
      if (token) {
        fetch("/api/admin?action=settings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: "homepage", data: updated }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  // CAFE INFO
  const updateCafeInfo = (info: Partial<CafeConfig>) => {
    setCafeInfo((prev) => {
      const updated = { ...prev, ...info };
      const token = getAuthToken();
      if (token) {
        fetch("/api/admin?action=settings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: "store", data: updated }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  // ORDERS
  const addOrder = (
    order: Omit<OrderRecord, "id" | "createdAt">,
    idToken?: string
  ): OrderRecord => {
    const newId = (1000 + orders.length + 1).toString();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const fullOrder: OrderRecord = {
      ...order,
      id: newId,
      createdAt: timeStr,
      timestamp: Date.now(),
    };
    setOrders((prev) => [fullOrder, ...prev]);

    // Persist to backend and Firestore
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
    fetch("/api/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(fullOrder),
    }).catch(() => {});

    return fullOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: OrderRecord["paymentStatus"]
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, ...(paymentStatus ? { paymentStatus } : {}) } : o))
    );

    const token = getAuthToken();
    if (token) {
      fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: orderId, status, paymentStatus }),
      }).catch(() => {});
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    const token = getAuthToken();
    if (token) {
      fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  // RESERVATIONS
  const addReservation = (reservation: Omit<ReservationRecord, "id">) => {
    const newRecord: ReservationRecord = {
      ...reservation,
      id: `R-${100 + reservations.length + 1}`,
      createdAt: Date.now(),
    };
    setReservations((prev) => [newRecord, ...prev]);

    const token = getAuthToken();
    if (token) {
      fetch("/api/admin?action=reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservation: newRecord }),
      }).catch(() => {});
    }
  };

  const updateReservationStatus = (id: string, status: ReservationStatus) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    const token = getAuthToken();
    if (token) {
      fetch("/api/admin?action=reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      }).catch(() => {});
    }
  };

  const deleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));

    const token = getAuthToken();
    if (token) {
      fetch(`/api/admin?action=reservations&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  // GIFTING OPERATIONS
  const addGiftProduct = (gift: Omit<GiftProduct, "id"> & { id?: string }) => {
    const slug = gift.slug || gift.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newId = gift.id || slug;
    const fullGift: GiftProduct = {
      ...gift,
      id: newId,
      slug,
      sortOrder: gift.sortOrder || giftProducts.length + 1,
    };
    setGiftProducts((prev) => [fullGift, ...prev]);

    const token = getAuthToken();
    if (token) {
      fetch("/api/gifting", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item: fullGift }),
      }).catch(() => {});
    }
  };

  const updateGiftProduct = (updated: GiftProduct) => {
    setGiftProducts((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));

    const token = getAuthToken();
    if (token) {
      fetch("/api/gifting", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item: updated }),
      }).catch(() => {});
    }
  };

  const deleteGiftProduct = (id: string) => {
    setGiftProducts((prev) => prev.filter((g) => g.id !== id));

    const token = getAuthToken();
    if (token) {
      fetch(`/api/gifting?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const toggleGiftAvailability = (id: string) => {
    setGiftProducts((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, isAvailable: !g.isAvailable };
          const token = getAuthToken();
          if (token) {
            fetch("/api/gifting", {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ item: updated }),
            }).catch(() => {});
          }
          return updated;
        }
        return g;
      })
    );
  };

  const addGiftCategory = (cat: GiftCategory) => {
    setGiftCategories((prev) => [...prev, cat]);
  };

  const updateGiftCategory = (cat: GiftCategory) => {
    setGiftCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const deleteGiftCategory = (id: string) => {
    setGiftCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addGiftAddon = (addon: Omit<GiftAddon, "id"> & { id?: string }) => {
    const newId = addon.id || `addon-${Date.now()}`;
    setGiftAddons((prev) => [...prev, { ...addon, id: newId }]);
  };

  const updateGiftAddon = (addon: GiftAddon) => {
    setGiftAddons((prev) => prev.map((a) => (a.id === addon.id ? addon : a)));
  };

  const deleteGiftAddon = (id: string) => {
    setGiftAddons((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAddonAvailability = (id: string) => {
    setGiftAddons((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isAvailable: !a.isAvailable } : a))
    );
  };

  const addGiftingOrder = (
    order: Omit<GiftingOrderRecord, "id" | "createdAt">
  ): GiftingOrderRecord => {
    const newId = `G-${200 + giftingOrders.length + 1}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const fullOrder: GiftingOrderRecord = {
      ...order,
      id: newId,
      createdAt: timeStr,
    };
    setGiftingOrders((prev) => [fullOrder, ...prev]);

    fetch("/api/gifting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "place_gift_order", order: fullOrder }),
    }).catch(() => {});

    return fullOrder;
  };

  const updateGiftingOrderStatus = (orderId: string, status: GiftingOrderStatus) => {
    setGiftingOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteGiftingOrder = (orderId: string) => {
    setGiftingOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const updateGiftingSettings = (newSettings: Partial<GiftingSettings>) => {
    setGiftingSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      const token = getAuthToken();
      if (token) {
        fetch("/api/admin?action=settings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: "gifting", data: updated }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  // SETTINGS
  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      const token = getAuthToken();
      if (token && newSettings.isMaintenanceMode !== undefined) {
        fetch("/api/admin?action=settings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            type: "store",
            data: { isMaintenanceMode: newSettings.isMaintenanceMode },
          }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const resetToDefaults = () => {
    setMenuItems(MENU_ITEMS.map((item) => ({ ...item, isAvailable: item.isAvailable !== false })));
    setCategories(MENU_CATEGORIES);
    setFeaturedItemIds(["dark-and-white-delight", "paneer-pizza", "cheese-sandwich", "cold-coffee"]);
    setGalleryItems(initialGallery);
    setHomepageContent(initialHomepage);
    setCafeInfo(CAFE_CONFIG);
    setOrders([]);
    setReservations([]);
    setGiftProducts(GIFT_PRODUCTS);
    setGiftCategories(GIFT_CATEGORIES);
    setGiftAddons(GIFT_ADDONS);
    setGiftingSettings(DEFAULT_GIFTING_SETTINGS);
    setGiftingOrders([]);
    setSettings(initialSettings);
    localStorage.clear();
  };

  return (
    <DataContext.Provider
      value={{
        menuItems,
        categories,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        duplicateMenuItem,
        toggleItemAvailability,

        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,

        featuredItemIds,
        updateFeaturedItemIds,
        toggleFeaturedItem,

        galleryItems,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        toggleGalleryVisibility,

        homepageContent,
        updateHomepageContent,

        cafeInfo,
        updateCafeInfo,

        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,

        reservations,
        addReservation,
        updateReservationStatus,
        deleteReservation,

        giftProducts,
        addGiftProduct,
        updateGiftProduct,
        deleteGiftProduct,
        toggleGiftAvailability,

        giftCategories,
        addGiftCategory,
        updateGiftCategory,
        deleteGiftCategory,

        giftAddons,
        addGiftAddon,
        updateGiftAddon,
        deleteGiftAddon,
        toggleAddonAvailability,

        giftingOrders,
        addGiftingOrder,
        updateGiftingOrderStatus,
        deleteGiftingOrder,

        giftingSettings,
        updateGiftingSettings,

        settings,
        updateSettings,
        resetToDefaults,

        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { MenuItem } from "../data/menuData";
import { useData } from "./DataContext";
import { useCustomerAuth } from "./CustomerAuthContext";

export interface OrderItem {
  item: MenuItem & {
    isGift?: boolean;
    giftNote?: string;
    giftAddons?: string[];
    isCustomGift?: boolean;
    recipientName?: string;
    customSummary?: string;
  };
  quantity: number;
}

export interface AddGiftPayload {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  giftNote?: string;
  giftAddons?: string[];
  recipientName?: string;
  isCustomGift?: boolean;
  customSummary?: string;
}

interface OrderContextType {
  items: OrderItem[];
  addItem: (item: MenuItem) => void;
  addGiftToOrder: (gift: AddGiftPayload) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearOrder: () => void;
  totalCount: number;
  totalAmount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  generateWhatsAppUrl: () => string;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cafeInfo } = useData();
  const { user } = useCustomerAuth();

  // Scoped storage key per user (or guest)
  const getStorageKey = (uid?: string | null) => (uid ? `tcc_cart_${uid}` : "tcc_cart_guest");

  // Clean up any legacy, un-scoped global cart from previous versions to prevent stale item leaks
  useEffect(() => {
    try {
      localStorage.removeItem("classic_crush_order");
    } catch {}
  }, []);

  const [items, setItems] = useState<OrderItem[]>(() => {
    try {
      const key = getStorageKey(user?.uid);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const prevUidRef = useRef<string | null | undefined>(user?.uid);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Synchronize cart state on user login, logout, or account switch
  useEffect(() => {
    const currentUid = user?.uid ?? null;
    const prevUid = prevUidRef.current ?? null;

    if (currentUid !== prevUid) {
      prevUidRef.current = currentUid;
      try {
        const key = getStorageKey(currentUid);
        const saved = localStorage.getItem(key);
        // Load only this user's legitimate saved cart, or start with clean empty cart
        setItems(saved ? JSON.parse(saved) : []);
      } catch {
        setItems([]);
      }
    }
  }, [user?.uid]);

  // Persist cart changes strictly under the active user's scoped storage key
  useEffect(() => {
    try {
      const key = getStorageKey(user?.uid);
      if (items.length > 0) {
        localStorage.setItem(key, JSON.stringify(items));
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // storage quota or private mode
    }
  }, [items, user?.uid]);

  const addItem = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const addGiftToOrder = (gift: AddGiftPayload) => {
    const giftId = `${gift.id}-${Date.now().toString().slice(-4)}`;
    const syntheticItem: OrderItem["item"] = {
      id: giftId,
      name: gift.name,
      category: "all",
      price: gift.price,
      description: gift.description || "",
      image: gift.image,
      isVegetarian: true,
      isGift: true,
      giftNote: gift.giftNote,
      giftAddons: gift.giftAddons,
      recipientName: gift.recipientName,
      isCustomGift: gift.isCustomGift,
      customSummary: gift.customSummary,
    };

    setItems((prev) => [...prev, { item: syntheticItem, quantity: 1 }]);
    setIsDrawerOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.item.id === itemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const clearOrder = () => {
    setItems([]);
    try {
      const key = getStorageKey(user?.uid);
      localStorage.removeItem(key);
    } catch {}
  };

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const generateWhatsAppUrl = () => {
    const cafeName = cafeInfo.name || "The Classic Crush";
    const waNumber = cafeInfo.whatsappNumber || "919876543210";

    if (items.length === 0) {
      const msg = `Hi ${cafeName}! 👋 I am visiting your website and would like to order or check today's specials.`;
      return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    }

    const hasGifts = items.some((i) => i.item.isGift);
    const lines: string[] = [
      `Hi ${cafeName}! 👋`,
      hasGifts
        ? `I would like to place an order/gifting inquiry from your website:`
        : `I would like to place an order from your website:`,
      "",
    ];

    items.forEach((i) => {
      if (i.item.isGift) {
        lines.push(`🎁 ${i.quantity}x ${i.item.name} — ₹${i.item.price * i.quantity}`);
        if (i.item.customSummary) {
          lines.push(`   Includes: ${i.item.customSummary}`);
        }
        if (i.item.recipientName) {
          lines.push(`   For: ${i.item.recipientName}`);
        }
        if (i.item.giftAddons && i.item.giftAddons.length > 0) {
          lines.push(`   Add-ons: ${i.item.giftAddons.join(", ")}`);
        }
        if (i.item.giftNote) {
          lines.push(`   Card Message: "${i.item.giftNote}"`);
        }
      } else {
        lines.push(`• ${i.quantity}x ${i.item.name} — ₹${i.item.price * i.quantity}`);
      }
    });

    lines.push("");
    lines.push(`Estimated Subtotal: ₹${totalAmount}`);
    lines.push("");
    lines.push("Customer Details:");
    lines.push("Name: ");
    lines.push("Contact Phone: ");
    lines.push("Fulfilment: Pickup / Delivery");
    lines.push("Requested Date & Time: ");
    lines.push("Delivery Address (if applicable): ");
    lines.push("Special instructions: ");
    lines.push("");
    lines.push("*(Please confirm order & availability)*");

    const text = lines.join("\n");
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <OrderContext.Provider
      value={{
        items,
        addItem,
        addGiftToOrder,
        removeItem,
        updateQuantity,
        clearOrder,
        totalCount,
        totalAmount,
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        generateWhatsAppUrl,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};

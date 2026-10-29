/**
 * Unified Admin Service Layer for The Classic Crush (TCC)
 * Provides typed, secure communications with persistent Firestore backend.
 */

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalMenuItems: number;
  availableMenuItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  bestSellers: { id: string; name: string; count: number; revenue: number }[];
  recentOrders: any[];
}

export interface CustomerRecord {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string | number | null;
  defaultDeliveryLocation?: any;
  totalOrders: number;
  totalSpend: number;
  orders: any[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Baking" | "Dairy" | "Beverages" | "Packaging" | "Kitchen" | string;
  linkedProductId?: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: number;
}

export interface ReviewRecord {
  id: string;
  customerId?: string;
  customerName: string;
  rating: number;
  comment: string;
  targetType: "cafe" | "product";
  targetId?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export interface OfferRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
  validUntil?: string;
  usageCount?: number;
  createdAt?: number;
}

const AUTH_TOKEN_KEY = "classic_crush_admin_session_token";

export function getAdminAuthToken(): string | null {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ----------------- DASHBOARD -----------------
export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch("/api/admin?action=stats", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.stats : null;
  } catch {
    return null;
  }
}

// ----------------- CUSTOMERS -----------------
export async function fetchAdminCustomers(): Promise<CustomerRecord[]> {
  try {
    const res = await fetch("/api/admin?action=customers", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.customers) ? json.customers : [];
  } catch {
    return [];
  }
}

// ----------------- INVENTORY -----------------
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  try {
    const res = await fetch("/api/admin?action=inventory", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.items) ? json.items : [];
  } catch {
    return [];
  }
}

export async function saveInventoryItem(
  item: Partial<InventoryItem> & { name: string; quantity: number }
): Promise<InventoryItem | null> {
  try {
    const isEdit = !!item.id;
    const res = await fetch("/api/admin?action=inventory", {
      method: isEdit ? "PUT" : "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ item }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.item : null;
  } catch {
    return null;
  }
}

export async function adjustInventoryStock(id: string, delta: number): Promise<InventoryItem | null> {
  try {
    const res = await fetch(`/api/admin?action=inventory&id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, delta }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.item : null;
  } catch {
    return null;
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin?action=inventory&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------- REVIEWS -----------------
export async function fetchAdminReviews(): Promise<ReviewRecord[]> {
  try {
    const res = await fetch("/api/admin?action=reviews", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.reviews) ? json.reviews : [];
  } catch {
    return [];
  }
}

export async function moderateReview(id: string, status: "approved" | "rejected" | "pending"): Promise<boolean> {
  try {
    const res = await fetch("/api/admin?action=reviews", {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin?action=reviews&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchPublicReviews(): Promise<ReviewRecord[]> {
  try {
    const res = await fetch("/api/admin?action=public_reviews");
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.reviews) ? json.reviews : [];
  } catch {
    return [];
  }
}

export async function submitCustomerReview(data: {
  customerName: string;
  rating: number;
  comment: string;
  customerId?: string;
  targetType?: "cafe" | "product";
  targetId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin?action=submit_review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { success: json.success, error: json.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------- OFFERS & COUPONS -----------------
export async function fetchAdminOffers(): Promise<OfferRecord[]> {
  try {
    const res = await fetch("/api/admin?action=offers", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.offers) ? json.offers : [];
  } catch {
    return [];
  }
}

export async function saveOffer(offer: Partial<OfferRecord> & { code: string }): Promise<OfferRecord | null> {
  try {
    const isEdit = !!offer.id;
    const res = await fetch("/api/admin?action=offers", {
      method: isEdit ? "PUT" : "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ offer }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.offer : null;
  } catch {
    return null;
  }
}

export async function deleteOffer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin?action=offers&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ success: boolean; coupon?: any; error?: string }> {
  try {
    const res = await fetch(
      `/api/admin?action=validate_coupon&code=${encodeURIComponent(code)}&subtotal=${subtotal}`
    );
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to validate promo code" };
  }
}

// ----------------- SETTINGS & CONTENT -----------------
export async function saveSettingsDoc(type: "store" | "featured" | "homepage" | "gifting", data: any): Promise<boolean> {
  try {
    const res = await fetch("/api/admin?action=settings", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchSettingsDoc(type: "store" | "featured" | "homepage" | "gifting"): Promise<any | null> {
  try {
    const res = await fetch(`/api/admin?action=settings&type=${type}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useData, type OrderRecord } from "../context/DataContext";
import { CampusLocationPicker } from "../components/CampusLocationPicker";
import { type CampusDeliveryLocation } from "../data/campusBoundary";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShoppingBag,
  Edit2,
  Save,
  X,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Package,
  Calendar,
  Eye,
  ShieldCheck,
  Building2,
} from "lucide-react";

export const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, customerProfile, isAuthenticated, isEmailVerified, loading, logout, updateCustomerProfile } =
    useCustomerAuth();
  const { orders: localOrders } = useData();

  // Navigation tab: 'profile' | 'current-orders' | 'order-history' | 'campus-location'
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "location">("orders");

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Campus Location Edit State
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState<CampusDeliveryLocation | null>(null);

  // Logout Confirmation Modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Live Firestore orders state
  const [firestoreOrders, setFirestoreOrders] = useState<OrderRecord[]>([]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Sync edit form with profile
  useEffect(() => {
    if (customerProfile) {
      setEditName(customerProfile.name || "");
      setEditPhone(customerProfile.phone || "");
      setTempLocation(customerProfile.defaultDeliveryLocation || null);
    }
  }, [customerProfile]);

  // Subscribe to customer's live orders in Firestore
  useEffect(() => {
    if (!user) return;

    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("customerId", "==", user.uid));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: OrderRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          // Sort by timestamp or createdAt descending
          list.sort((a, b) => {
            const timeA = (a as any).timestamp || 0;
            const timeB = (b as any).timestamp || 0;
            return timeB - timeA;
          });
          setFirestoreOrders(list);
        },
        () => {
          // Fallback if rule restricts or offline: filter from localOrders
          const fallback = localOrders.filter(
            (o) =>
              (o as any).customerId === user.uid ||
              (customerProfile?.phone && o.customerPhone === customerProfile.phone)
          );
          setFirestoreOrders(fallback);
        }
      );

      return () => unsubscribe();
    } catch {
      // Local fallback
      const fallback = localOrders.filter(
        (o) =>
          (o as any).customerId === user?.uid ||
          (customerProfile?.phone && o.customerPhone === customerProfile.phone)
      );
      setFirestoreOrders(fallback);
    }
  }, [user, customerProfile, localOrders]);

  // Merge orders: Firestore orders + any matching local context orders
  const allOrders = React.useMemo(() => {
    const combined = [...firestoreOrders];
    localOrders.forEach((lo) => {
      const match =
        (lo as any).customerId === user?.uid ||
        (customerProfile?.phone && lo.customerPhone === customerProfile.phone);
      if (match && !combined.some((co) => co.id === lo.id)) {
        combined.push(lo);
      }
    });
    return combined;
  }, [firestoreOrders, localOrders, user, customerProfile]);

  // Categorize orders
  const activeOrders = allOrders.filter(
    (o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing" || o.status === "Ready"
  );
  const completedOrders = allOrders.filter(
    (o) => o.status === "Completed" || o.status === "Cancelled"
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (!editName.trim()) {
      setSaveError("Full name cannot be empty.");
      return;
    }

    const digits = editPhone.replace(/[^0-9]/g, "");
    const cleanDigits = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      setSaveError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsSaving(true);
    const formattedPhone = `+91 ${cleanDigits}`;
    const res = await updateCustomerProfile({
      name: editName.trim(),
      phone: formattedPhone,
    });
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(null), 4000);
    } else {
      setSaveError(res.error || "Failed to update profile.");
    }
  };

  const handleSaveLocation = async (loc: CampusDeliveryLocation) => {
    setIsSaving(true);
    setTempLocation(loc);
    const res = await updateCustomerProfile({
      defaultDeliveryLocation: loc,
    });
    setIsSaving(false);
    if (res.success) {
      setIsEditingLocation(false);
      setSaveSuccess("Default CSJMU campus delivery location saved!");
      setTimeout(() => setSaveSuccess(null), 4000);
    } else {
      setSaveError(res.error || "Could not save campus location.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5EFEB]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F3A23] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-widest uppercase text-[#0F3A23]">
            Loading Profile...
          </span>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "Pending":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            Order Placed
          </span>
        );
      case "Confirmed":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            Confirmed
          </span>
        );
      case "Preparing":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
            Preparing in Kitchen
          </span>
        );
      case "Ready":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            Ready for Pickup / Out for Delivery
          </span>
        );
      case "Completed":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E6F0EB] text-[#0F3A23] border border-[#0F3A23]/20">
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F5EFEB]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Email Verification Alert Banner */}
        {!isEmailVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs animate-hero-fade">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Your email address (<strong>{user?.email}</strong>) is not yet verified. Please verify your email to unlock all account capabilities.
              </span>
            </div>
            <Link
              to="/verify-email"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] uppercase tracking-wider shrink-0 transition-colors"
            >
              <span>Verify Email Now</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Profile Header Banner */}
        <div className="bg-white rounded-3xl border border-[#E2D9CC] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0F3A23] text-[#FAF6F0] flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
                {(customerProfile?.name || user?.displayName || "C").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C99742]">
                    Customer Account
                  </span>
                  {isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F0EB] text-[#0F3A23] text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3 text-[#0F3A23]" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <Link
                      to="/verify-email"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold hover:bg-amber-200 transition-colors"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>Unverified Email</span>
                    </Link>
                  )}
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3A23]">
                  {customerProfile?.name || user?.displayName || "The Classic Crush Customer"}
                </h1>
                <p className="text-xs text-[#6E776F] mt-0.5">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="self-start sm:self-auto px-4 py-2 rounded-full border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Success / Error notification */}
          {saveSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-[#E6F0EB] border border-[#0F3A23]/20 flex items-center gap-2 text-xs text-[#0F3A23] animate-hero-fade">
              <CheckCircle2 className="w-4 h-4 text-[#C99742]" />
              <span>{saveSuccess}</span>
            </div>
          )}
          {saveError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 animate-hero-fade">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{saveError}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-[#E2D9CC] pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-[#0F3A23] text-white shadow-xs"
                : "bg-white/60 text-[#162820] hover:bg-white"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>My Orders ({allOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "profile"
                ? "bg-[#0F3A23] text-white shadow-xs"
                : "bg-white/60 text-[#162820] hover:bg-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal Details</span>
          </button>

          <button
            onClick={() => setActiveTab("location")}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "location"
                ? "bg-[#0F3A23] text-white shadow-xs"
                : "bg-white/60 text-[#162820] hover:bg-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved CSJMU Location</span>
          </button>
        </div>

        {/* ==============================================================
            TAB 1: MY ORDERS (CURRENT & HISTORY)
            ============================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* 1. CURRENT / ACTIVE ORDERS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0F3A23]">
                    Active & Ongoing Orders
                  </h2>
                  <p className="text-xs text-[#6E776F]">
                    Live updates on orders being prepared or out for delivery.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#0F3A23] bg-[#E6F0EB] px-2.5 py-0.5 rounded-full">
                  {activeOrders.length} Active
                </span>
              </div>

              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E2D9CC] p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF6F0] text-[#0F3A23] flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6 stroke-1" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#0F3A23]">
                    No active orders at the moment
                  </h3>
                  <p className="text-xs text-[#6E776F] max-w-sm mx-auto font-light">
                    Hungry? Browse our pure vegetarian café menu or assemble an artisan gift box.
                  </p>
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    <span>Browse Menu</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border-2 border-[#0F3A23]/30 p-5 shadow-xs space-y-4 transition-all hover:border-[#0F3A23]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#FAF6F0]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-[#0F3A23]">
                            Order #{ord.id}
                          </span>
                          <span className="text-xs text-[#6E776F] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {ord.createdAt}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#2F3E37] px-2 py-0.5 rounded-md bg-[#FAF6F0]">
                            {ord.orderType}
                          </span>
                          {getStatusBadge(ord.status)}
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-1.5">
                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs text-[#162820]"
                          >
                            <span className="font-medium">
                              {item.quantity} × {item.name}
                            </span>
                            <span className="text-[#6E776F]">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* CSJMU Delivery address if delivery order */}
                      {ord.deliveryLocation && (
                        <div className="p-2.5 rounded-xl bg-[#E6F0EB]/60 border border-[#0F3A23]/10 text-xs text-[#0F3A23] flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#0F3A23] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">
                              CSJMU Campus Delivery: {ord.deliveryLocation.building}
                            </span>
                            {ord.deliveryLocation.room && (
                              <span className="text-[11px] text-[#2F3E37] block">
                                Room/Floor: {ord.deliveryLocation.room}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#FAF6F0]">
                        <div className="text-xs">
                          <span className="text-[#6E776F]">Payment: </span>
                          <span className="font-semibold text-[#162820]">Pay on Pickup / Delivery</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs text-[#6E776F] block">Total Amount</span>
                            <span className="font-serif text-lg font-bold text-[#0F3A23]">
                              ₹{ord.totalAmount}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3.5 py-1.5 rounded-full bg-[#FAF6F0] hover:bg-[#E8DFD1] text-[#0F3A23] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. ORDER HISTORY (PAST COMPLETED / CANCELLED) */}
            <div className="space-y-3 pt-4 border-t border-[#E2D9CC]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0F3A23]">Order History</h2>
                <p className="text-xs text-[#6E776F]">
                  Past completed treats and previous orders placed with TCC.
                </p>
              </div>

              {completedOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E2D9CC] p-6 text-center text-xs text-[#6E776F]">
                  No past completed orders found yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {completedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-[#E2D9CC] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:bg-[#FAF6F0]/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0F3A23]">
                            Order #{ord.id}
                          </span>
                          <span className="text-[11px] text-[#6E776F] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {ord.createdAt}
                          </span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <p className="text-xs text-[#2F3E37]">
                          {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto">
                        <span className="font-serif text-base font-bold text-[#0F3A23]">
                          ₹{ord.totalAmount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1 rounded-full border border-[#E2D9CC] hover:bg-[#FAF6F0] text-xs text-[#0F3A23] font-semibold tracking-wider uppercase transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 2: PERSONAL DETAILS (EDITABLE)
            ============================================================== */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl border border-[#E2D9CC] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#FAF6F0]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0F3A23]">Personal Details</h2>
                <p className="text-xs text-[#6E776F]">
                  Manage your name and phone number for faster delivery and contact.
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#C99742]" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] focus:bg-white transition-colors"
                    />
                    <User className="w-4 h-4 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Mobile Phone (India) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] focus:bg-white transition-colors"
                    />
                    <Phone className="w-4 h-4 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={customerProfile?.email || user?.email || ""}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-[#6E776F] mt-1">
                    Email address is tied to your Firebase Authentication account.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-full bg-[#0F3A23] hover:bg-[#154D30] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C99742]" />
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(customerProfile?.name || "");
                      setEditPhone(customerProfile?.phone || "");
                    }}
                    className="px-5 py-2.5 rounded-full border border-[#E2D9CC] hover:bg-[#FAF6F0] text-xs text-[#6E776F] font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
                <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#E2D9CC] space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#6E776F]">
                    <User className="w-3.5 h-3.5" />
                    <span>Full Name</span>
                  </div>
                  <p className="font-serif text-base font-bold text-[#0F3A23]">
                    {customerProfile?.name || "Not set"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#E2D9CC] space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#6E776F]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile Phone</span>
                  </div>
                  <p className="font-serif text-base font-bold text-[#0F3A23]">
                    {customerProfile?.phone || "Not set"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#E2D9CC] space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-[#6E776F]">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Address</span>
                  </div>
                  <p className="font-mono text-sm text-[#0F3A23]">
                    {customerProfile?.email || user?.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            TAB 3: SAVED CSJMU CAMPUS DELIVERY LOCATION
            ============================================================== */}
        {activeTab === "location" && (
          <div className="bg-white rounded-3xl border border-[#E2D9CC] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#FAF6F0]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0F3A23]">
                  Default CSJMU Campus Location
                </h2>
                <p className="text-xs text-[#6E776F]">
                  Save your hostel, department, or reading hall for 1-click checkout.
                </p>
              </div>

              {!isEditingLocation && (
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(true)}
                  className="px-4 py-2 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#C99742]" />
                  <span>Update Location</span>
                </button>
              )}
            </div>

            {isEditingLocation ? (
              <div className="space-y-4">
                <CampusLocationPicker
                  initialLocation={tempLocation}
                  customerName={customerProfile?.name || ""}
                  customerPhone={customerProfile?.phone || ""}
                  onLocationConfirmed={(loc) => handleSaveLocation(loc)}
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsEditingLocation(false)}
                    className="px-4 py-2 text-xs text-[#6E776F] hover:text-[#0F3A23] font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : customerProfile?.defaultDeliveryLocation ? (
              <div className="p-5 rounded-2xl bg-[#E6F0EB] border border-[#0F3A23]/20 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F3A23] uppercase tracking-wider">
                    Verified Campus Delivery Address
                  </span>
                  <span className="text-[10px] bg-white text-[#0F3A23] px-2 py-0.5 rounded-full font-semibold border border-[#0F3A23]/20">
                    Saved
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0F3A23]">
                  {customerProfile.defaultDeliveryLocation.building}
                </h3>
                {customerProfile.defaultDeliveryLocation.room && (
                  <p className="text-xs text-[#2F3E37]">
                    Room / Floor: {customerProfile.defaultDeliveryLocation.room}
                  </p>
                )}
                {customerProfile.defaultDeliveryLocation.instructions && (
                  <p className="text-xs text-[#6E776F] italic">
                    Instructions: &ldquo;{customerProfile.defaultDeliveryLocation.instructions}&rdquo;
                  </p>
                )}
                <div className="text-[10px] text-[#6E776F] font-mono pt-1">
                  GPS: {customerProfile.defaultDeliveryLocation.lat.toFixed(5)},{" "}
                  {customerProfile.defaultDeliveryLocation.lng.toFixed(5)}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#FAF6F0] border border-[#E2D9CC] text-center space-y-3">
                <Building2 className="w-8 h-8 text-[#0F3A23] mx-auto stroke-1" />
                <h3 className="font-serif text-base font-bold text-[#0F3A23]">
                  No default delivery location saved yet
                </h3>
                <p className="text-xs text-[#6E776F] max-w-sm mx-auto font-light">
                  Save your hostel or campus building so your food is delivered directly to you with no repetitive typing.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(true)}
                  className="px-5 py-2.5 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C99742]" />
                  <span>Pick Campus Location Now</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==============================================================
          ORDER DETAIL MODAL
          ============================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-hero-fade">
          <div className="bg-white rounded-3xl border border-[#E2D9CC] max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF6F0]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C99742]">
                  Order Details
                </span>
                <h3 className="font-serif text-xl font-bold text-[#0F3A23]">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#6E776F] hover:text-[#0F3A23] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6E776F]">Placed At: {selectedOrder.createdAt}</span>
              {getStatusBadge(selectedOrder.status)}
            </div>

            {/* Items list */}
            <div className="space-y-2 pt-2 border-t border-[#FAF6F0]">
              <span className="text-xs font-bold text-[#0F3A23] uppercase tracking-wider block">
                Items Ordered
              </span>
              <div className="space-y-1.5">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FAF6F0]"
                  >
                    <span className="font-medium text-[#162820]">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="font-semibold text-[#0F3A23]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details */}
            {selectedOrder.deliveryLocation && (
              <div className="p-3 rounded-xl bg-[#E6F0EB] text-xs space-y-1 text-[#0F3A23]">
                <span className="font-bold block uppercase tracking-wider text-[10px]">
                  CSJMU Campus Delivery Details
                </span>
                <p className="font-semibold">{selectedOrder.deliveryLocation.building}</p>
                {selectedOrder.deliveryLocation.room && (
                  <p>Room/Floor: {selectedOrder.deliveryLocation.room}</p>
                )}
                {selectedOrder.deliveryLocation.instructions && (
                  <p className="italic text-[#2F3E37]">
                    &ldquo;{selectedOrder.deliveryLocation.instructions}&rdquo;
                  </p>
                )}
                <p className="font-mono text-[10px] text-[#6E776F]">
                  GPS: {selectedOrder.deliveryLocation.lat}, {selectedOrder.deliveryLocation.lng}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="pt-3 border-t border-[#FAF6F0] flex items-center justify-between">
              <span className="text-xs text-[#6E776F] font-semibold uppercase">Total Paid / Due</span>
              <span className="font-serif text-2xl font-bold text-[#0F3A23]">
                ₹{selectedOrder.totalAmount}
              </span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 rounded-full bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#154D30] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          LOGOUT CONFIRMATION MODAL
          ============================================================== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-hero-fade">
          <div className="bg-white rounded-3xl border border-[#E2D9CC] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0F3A23]">Log Out?</h3>
              <p className="text-xs text-[#6E776F] mt-1 font-light">
                Are you sure you want to log out of your TCC customer account?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-[#E2D9CC] text-xs font-semibold uppercase tracking-wider text-[#6E776F] hover:bg-[#FAF6F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

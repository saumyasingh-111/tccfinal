import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData, type OrderRecord, type OrderStatus } from "../../context/DataContext";
import { fetchDashboardStats, type DashboardStats } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";
import {
  ShoppingBag,
  ArrowRight,
  Plus,
  Clock,
  Eye,
  X,
  Phone,
  Users,
  AlertTriangle,
  Flame,
  RefreshCw,
  Building2,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { menuItems, orders, updateOrderStatus, refreshData } = useData();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    const data = await fetchDashboardStats();
    setStats(data);
    await refreshData();
    setIsLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Real calculations (fallback to context if stats not yet loaded)
  const totalRevenue =
    stats?.totalRevenue ??
    orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const totalOrdersCount = stats?.totalOrders ?? orders.length;
  const pendingOrdersCount =
    stats?.pendingOrders ??
    orders.filter((o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing")
      .length;

  const totalCustomersCount = stats?.totalCustomers ?? 0;
  const lowStockCount = stats?.lowStockCount ?? 0;
  const bestSellers = stats?.bestSellers ?? [];
  const recentOrders = orders.slice(0, 6);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Order #${orderId} marked as ${newStatus}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Confirmed":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Preparing":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Ready":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Cancelled":
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  return (
    <AdminLayout
      pageTitle={`${greeting} 👋`}
      pageSubtitle="Live operational summary calculated from real Cloud Firestore records."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadStats();
              showToast("Dashboard refreshed.");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#162820] hover:bg-[#FAF6F0] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs border border-[#E2D9CC] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/menu"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064F50] hover:bg-[#043839] text-[#F8F5ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dish</span>
          </Link>
        </div>
      }
    >
      {/* 4 Primary Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Actual Sales Revenue
            </span>
            <span className="font-serif text-3xl font-bold text-[#0F3A23]">
              ₹{totalRevenue}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">From all confirmed orders</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <span className="font-serif font-bold text-lg">₹</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Orders Placed
            </span>
            <span className="font-serif text-3xl font-bold text-[#1C241E]">
              {totalOrdersCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">
              <span className="text-amber-700 font-medium">{pendingOrdersCount} in progress</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#26332A]">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Registered Customers
            </span>
            <span className="font-serif text-3xl font-bold text-[#064F50]">
              {totalCustomersCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Firebase Auth Verified</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#064F50]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Inventory Stock Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Inventory Alerts
            </span>
            <span
              className={`font-serif text-3xl font-bold ${
                lowStockCount > 0 ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {lowStockCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">
              {lowStockCount > 0 ? "Supplies needing restock" : "All supplies healthy"}
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center ${
              lowStockCount > 0
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        {/* Recent Orders Section (8/12) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#EFE9DE] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1C241E]">
                Recent Orders
              </h2>
              <p className="text-xs text-[#767E7A] font-light mt-0.5">
                Real customer &amp; campus delivery requests
              </p>
            </div>

            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#755546] hover:text-[#1C241E] transition-colors"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#755546] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EFE9DE]">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DE]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#767E7A] font-light">
                      <ShoppingBag className="w-8 h-8 text-[#A39B8E] mx-auto mb-2 opacity-50" />
                      <p className="font-medium text-[#1C241E]">No customer orders placed yet.</p>
                      <p className="text-xs text-[#767E7A] mt-1">
                        When customers order on the website, they will appear here in real-time.
                      </p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const itemsSummary = Array.isArray(order.items)
                      ? order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")
                      : "";

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#FAF7F2]/60 transition-colors cursor-pointer group"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#1C241E]">
                          #{order.id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#1C241E]">
                          <div>
                            <span>{order.customerName}</span>
                            {order.deliveryLocation && (
                              <span className="block text-[10px] text-emerald-800">
                                📍 {order.deliveryLocation.building}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className="py-3.5 px-4 max-w-xs truncate text-[#575E5B] font-light"
                          title={itemsSummary}
                        >
                          {itemsSummary}
                        </td>
                        <td className="py-3.5 px-4 font-serif font-bold text-[#1C241E]">
                          ₹{order.totalAmount}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#767E7A] font-light whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#9CA3AF]" />
                            <span>{order.createdAt}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="p-1 text-[#755546] hover:text-[#1C241E] rounded-md transition-colors cursor-pointer"
                            title="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best-Selling Products Leaderboard (4/12) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE9DE] pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="font-serif text-base font-bold text-[#1C241E]">
                Top Selling Dishes
              </h3>
            </div>
            <span className="text-[10px] uppercase font-semibold text-[#767E7A] tracking-wider">
              By Orders
            </span>
          </div>

          {bestSellers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#767E7A]">
              No sales recorded yet. Once orders are fulfilled, dishes will rank here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#0F3A23] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[#1C241E] truncate max-w-[130px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#0F3A23] block">
                      {item.count} sold
                    </span>
                    <span className="text-[10px] text-[#767E7A]">₹{item.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[#EFE9DE]">
            <Link
              to="/admin/menu"
              className="text-xs text-[#064F50] hover:underline font-semibold flex items-center justify-between"
            >
              <span>Manage cafe menu items ({menuItems.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5DFD5] relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#EFE9DE] pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-[#1C241E]">
                    Order #{selectedOrder.id}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-[#767E7A] mt-1">
                  Placed at {selectedOrder.createdAt} • Type:{" "}
                  <span className="font-medium text-[#1C241E]">{selectedOrder.orderType}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#767E7A] hover:text-[#1C241E] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C241E]">
                    {selectedOrder.customerName}
                  </span>
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="inline-flex items-center gap-1 text-[#064F50] hover:underline font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedOrder.customerPhone}</span>
                  </a>
                </div>
                {selectedOrder.customerEmail && (
                  <p className="text-[#6E776F]">{selectedOrder.customerEmail}</p>
                )}
                {selectedOrder.deliveryLocation && (
                  <p className="text-emerald-800 font-medium pt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>
                      {selectedOrder.deliveryLocation.building}
                      {selectedOrder.deliveryLocation.room ? `, ${selectedOrder.deliveryLocation.room}` : ""}
                    </span>
                  </p>
                )}
                {selectedOrder.note && (
                  <p className="text-[#755546] italic pt-1 border-t border-[#EFE9DE]">
                    Note: "{selectedOrder.note}"
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="border border-[#EFE9DE] rounded-xl overflow-hidden">
                <div className="bg-[#FAF7F2] px-3 py-2 font-semibold text-[#755546] uppercase text-[10px] tracking-wider border-b border-[#EFE9DE]">
                  Order Items
                </div>
                <div className="divide-y divide-[#EFE9DE]">
                  {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-medium text-[#1C241E]">{it.name}</span>
                          <span className="text-[11px] text-[#767E7A] ml-2">× {it.quantity}</span>
                        </div>
                        <span className="font-serif font-bold text-[#1C241E]">
                          ₹{(Number(it.price) || 0) * (Number(it.quantity) || 1)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#767E7A]">
                    Payment: {selectedOrder.paymentMethod || "UPI / QR / Cash"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#767E7A] block">Grand Total</span>
                  <span className="font-serif text-2xl font-bold text-[#0F3A23]">
                    ₹{selectedOrder.totalAmount}
                  </span>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-3 border-t border-[#EFE9DE]">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#755546] mb-2">
                  Update Workflow Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "Confirmed")}
                    className={`py-2 px-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                      selectedOrder.status === "Confirmed"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "Preparing")}
                    className={`py-2 px-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                      selectedOrder.status === "Preparing"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    Preparing
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "Completed")}
                    className={`py-2 px-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                      selectedOrder.status === "Completed"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

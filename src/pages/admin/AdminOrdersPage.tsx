import React, { useState, useMemo } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData, type OrderRecord, type OrderStatus } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import {
  ShoppingBag,
  Clock,
  Phone,
  X,
  Search,
  ExternalLink,
  Building2,
  RefreshCw,
  Tag,
} from "lucide-react";

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, refreshData } = useData();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const statusFilters = ["All", "Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = activeFilter === "All" || o.status === activeFilter;
      const matchesType = orderTypeFilter === "All" || o.orderType === orderTypeFilter;
      const matchesPayment = paymentFilter === "All" || (o.paymentStatus || "Pending") === paymentFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        o.id.includes(searchQuery) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery);
      return matchesStatus && matchesType && matchesPayment && matchesSearch;
    });
  }, [orders, activeFilter, orderTypeFilter, paymentFilter, searchQuery]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    showToast(`Order #${orderId} marked as ${status}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const handlePaymentStatusChange = (
    orderId: string,
    paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded"
  ) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;
    updateOrderStatus(orderId, ord.status, paymentStatus);
    showToast(`Order #${orderId} payment status marked as ${paymentStatus}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus });
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

  const getPaymentBadge = (paymentStatus?: string) => {
    const ps = paymentStatus || "Pending";
    switch (ps) {
      case "Paid":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Failed":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "Refunded":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  return (
    <AdminLayout
      pageTitle="Order Management"
      pageSubtitle="Track, verify, and process customer food and delivery orders in real-time."
      actions={
        <button
          onClick={() => {
            refreshData();
            showToast("Orders refreshed from Firestore.");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#162820] hover:bg-[#FAF6F0] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs border border-[#E2D9CC] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 w-full sm:w-auto py-0.5">
            {statusFilters.map((st) => {
              const count =
                st === "All" ? orders.length : orders.filter((o) => o.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setActiveFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeFilter === st
                      ? "bg-[#064F50] text-[#F8F5ED] shadow-2xs"
                      : "bg-[#FAF7F2] text-[#755546] hover:bg-[#EFE9DE]"
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeFilter === st ? "bg-[#F8F5ED]/20 text-white" : "bg-black/5 text-[#755546]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#767E7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-hidden focus:border-[#064F50]"
            />
          </div>
        </div>

        {/* Secondary Filters: Type & Payment */}
        <div className="pt-2 border-t border-[#EFE9DE] flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold text-[#767E7A]">Order Type:</span>
            <div className="flex items-center gap-1">
              {["All", "Takeaway", "Dine-in", "Delivery"].map((tp) => (
                <button
                  key={tp}
                  onClick={() => setOrderTypeFilter(tp)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    orderTypeFilter === tp
                      ? "bg-[#0F3A23] text-white"
                      : "bg-[#FAF6F0] text-[#755546] hover:bg-[#EFE9DE]"
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold text-[#767E7A]">Payment:</span>
            <div className="flex items-center gap-1">
              {["All", "Pending", "Paid"].map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPaymentFilter(pm)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    paymentFilter === pm
                      ? "bg-[#0F3A23] text-white"
                      : "bg-[#FAF6F0] text-[#755546] hover:bg-[#EFE9DE]"
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#755546] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EFE9DE]">
              <tr>
                <th className="py-3 px-4 sm:px-6">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Type &amp; Destination</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DE]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[#767E7A] font-light">
                    <ShoppingBag className="w-8 h-8 text-[#A39B8E] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-[#1C241E]">No orders match the selected filters.</p>
                    <p className="text-xs text-[#767E7A] mt-1">
                      Clear filters or wait for incoming customer orders.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
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
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#1C241E] block">
                          {order.customerName}
                        </span>
                        <span className="text-[10px] text-[#767E7A] font-mono">
                          {order.customerPhone}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4 max-w-xs truncate text-[#575E5B] font-light"
                        title={itemsSummary}
                      >
                        {itemsSummary}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#1C241E] block">
                          {order.orderType}
                        </span>
                        {order.deliveryLocation && (
                          <span className="text-[10px] text-emerald-800 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate max-w-[130px]">
                              {order.deliveryLocation.building}
                            </span>
                          </span>
                        )}
                        {order.tableNumber && (
                          <span className="text-[10px] text-[#767E7A]">Table: {order.tableNumber}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#0F3A23]">
                        ₹{order.totalAmount}
                        {order.discountAmount ? (
                          <span className="text-[10px] text-emerald-700 block font-sans">
                            -₹{order.discountAmount} promo
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPaymentBadge(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus || "Pending"}
                        </span>
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
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#E5DFD5] text-[#064F50] hover:bg-[#FAF6F0] font-semibold text-[11px] transition-all cursor-pointer shadow-2xs"
                        >
                          Details
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E5DFD5] relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#EFE9DE] pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-bold text-[#1C241E]">
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
                  <span className="font-semibold text-[#1C241E]">{selectedOrder.orderType}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#767E7A] hover:text-[#1C241E] rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Contact Box */}
              <div className="p-4 bg-[#FCFAF7] rounded-2xl border border-[#E5DFD5] space-y-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#755546] block">
                  Customer &amp; Contact Details
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#1C241E]">
                    {selectedOrder.customerName}
                  </span>
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="inline-flex items-center gap-1.5 text-[#064F50] hover:underline font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedOrder.customerPhone}</span>
                  </a>
                </div>
                {selectedOrder.customerEmail && (
                  <p className="text-[#6E776F]">{selectedOrder.customerEmail}</p>
                )}

                {/* CSJMU Campus Location */}
                {selectedOrder.deliveryLocation && (
                  <div className="pt-2 border-t border-[#EFE9DE] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>{selectedOrder.deliveryLocation.building}</span>
                      </span>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${selectedOrder.deliveryLocation.lat}&mlon=${selectedOrder.deliveryLocation.lng}#map=18/${selectedOrder.deliveryLocation.lat}/${selectedOrder.deliveryLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#064F50] hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>View Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {selectedOrder.deliveryLocation.room && (
                      <p className="text-[#6E776F]">
                        Room / Floor: {selectedOrder.deliveryLocation.room}
                      </p>
                    )}
                    {selectedOrder.deliveryLocation.instructions && (
                      <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Delivery note: {selectedOrder.deliveryLocation.instructions}
                      </p>
                    )}
                  </div>
                )}

                {selectedOrder.note && (
                  <p className="text-[#755546] italic pt-1 border-t border-[#EFE9DE]">
                    Customer Note: "{selectedOrder.note}"
                  </p>
                )}
              </div>

              {/* Items Table */}
              <div className="border border-[#E5DFD5] rounded-2xl overflow-hidden">
                <div className="bg-[#FAF7F2] px-4 py-2.5 font-semibold text-[#755546] uppercase text-[10px] tracking-wider border-b border-[#E5DFD5]">
                  Ordered Items
                </div>
                <div className="divide-y divide-[#EFE9DE]">
                  {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-[#1C241E]">{it.name}</span>
                          <span className="text-[11px] text-[#767E7A] ml-2">× {it.quantity}</span>
                        </div>
                        <span className="font-serif font-bold text-[#1C241E]">
                          ₹{(Number(it.price) || 0) * (Number(it.quantity) || 1)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-[#FCFAF7] rounded-2xl border border-[#E5DFD5] space-y-2">
                <div className="flex justify-between text-[#6E776F]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#162820]">
                    ₹{selectedOrder.subtotal || selectedOrder.totalAmount}
                  </span>
                </div>
                {selectedOrder.deliveryFee ? (
                  <div className="flex justify-between text-[#6E776F]">
                    <span>Campus Delivery Fee</span>
                    <span className="font-medium text-[#162820]">
                      ₹{selectedOrder.deliveryFee}
                    </span>
                  </div>
                ) : null}
                {selectedOrder.discountAmount ? (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Discount ({selectedOrder.couponCode})</span>
                    </span>
                    <span>-₹{selectedOrder.discountAmount}</span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center pt-2 border-t border-[#EFE9DE]">
                  <span className="font-bold text-[#1C241E] text-sm">Grand Total</span>
                  <span className="font-serif text-2xl font-bold text-[#0F3A23]">
                    ₹{selectedOrder.totalAmount}
                  </span>
                </div>
              </div>

              {/* Payment Status Manager */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#755546] block">
                    Payment Method: {selectedOrder.paymentMethod || "UPI / QR / Cash"}
                  </span>
                  <span className="text-xs text-[#1C241E] font-bold">
                    Current Status: {selectedOrder.paymentStatus || "Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, "Paid")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                      selectedOrder.paymentStatus === "Paid"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, "Pending")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                      (selectedOrder.paymentStatus || "Pending") === "Pending"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-amber-800 border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              {/* Action Buttons: Workflow status transitions */}
              <div className="pt-3 border-t border-[#EFE9DE]">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#755546] mb-2">
                  Update Workflow Status
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(["Confirmed", "Preparing", "Ready", "Completed", "Cancelled"] as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedOrder.id, st)}
                        className={`py-2 px-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                          selectedOrder.status === st
                            ? "bg-[#064F50] text-white border-[#064F50]"
                            : "bg-white text-[#1C241E] border-[#E5DFD5] hover:bg-[#FAF7F2]"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Delete this order record permanently from Firestore?")) {
                        deleteOrder(selectedOrder.id);
                        showToast(`Order #${selectedOrder.id} deleted.`);
                        setSelectedOrder(null);
                      }
                    }}
                    className="py-2 px-2 rounded-xl font-bold uppercase text-[10px] tracking-wider bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 cursor-pointer"
                  >
                    Delete
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

import React, { useState, useMemo } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData, type OrderRecord, type OrderStatus } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import {
  ShoppingBag,
  Clock,
  Plus,
  Phone,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, addOrder, deleteOrder } = useData();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const statusFilters = ["All", "Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = activeFilter === "All" || o.status === activeFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        o.id.includes(searchQuery) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery);
      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    showToast(`Order #${orderId} marked as ${status}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
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

  const createSimulatedOrder = () => {
    const sampleNames = ["Kabir Das", "Riya Sen", "Aditya Verma", "Meera Nair", "Karan Singhal"];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const newOrd = addOrder({
      customerName: randomName,
      customerPhone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      items: [
        { id: "paneer-pizza", name: "Paneer Pizza", quantity: 1, price: 69 },
        { id: "dark-and-white-delight", name: "Dark & White Delight", quantity: 1, price: 59 },
      ],
      totalAmount: 128,
      status: "Pending",
      orderType: Math.random() > 0.5 ? "Dine-in" : "Takeaway",
      note: "Made fresh on customer website",
    });
    showToast(`New simulated Order #${newOrd.id} created!`);
  };

  return (
    <AdminLayout
      pageTitle="Order Management"
      pageSubtitle="Track and process customer orders in real-time."
      actions={
        <button
          onClick={createSimulatedOrder}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064F50] hover:bg-[#043839] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Simulate New Order</span>
        </button>
      }
    >
      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 w-full sm:w-auto py-0.5">
            {statusFilters.map((st) => {
              const isActive = activeFilter === st;
              const count =
                st === "All" ? orders.length : orders.filter((o) => o.status === st).length;

              return (
                <button
                  key={st}
                  onClick={() => setActiveFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#26332A] text-white shadow-2xs"
                      : "bg-[#FAF7F2] text-[#575E5B] hover:bg-[#EFE9DE] border border-[#E5DFD5]"
                  }`}
                >
                  <span>{st}</span>
                  <span className="ml-1 text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by order #, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
            />
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#755546] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EFE9DE]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DE]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-[#767E7A] font-light">
                    <ShoppingBag className="w-8 h-8 text-[#D5C7B5] mx-auto mb-2 stroke-1" />
                    <span>No orders found matching this filter.</span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemsSummary = order.items
                    .map((i) => `${i.name} ×${i.quantity}`)
                    .join(", ");

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-[#FAF7F2]/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#1C241E]">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#1C241E]">{order.customerName}</div>
                        <div className="text-[10px] text-[#767E7A]">{order.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-[#575E5B] font-light" title={itemsSummary}>
                        {itemsSummary}
                      </td>
                      <td className="py-3.5 px-4 text-[#755546] font-medium whitespace-nowrap">
                        {order.orderType}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#1C241E] whitespace-nowrap">
                        ₹{order.totalAmount}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#EFE9DE] border border-[#E5DFD5] rounded-lg text-[11px] font-semibold text-[#1C241E] transition-colors"
                        >
                          Manage
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

      {/* Order Modal Detail */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5DFD5] overflow-hidden p-6 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-[#EFE9DE]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755546]">
                  Order Processing
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C241E]">
                  ORDER #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#767E7A] hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Customer Box */}
              <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EFE9DE] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#767E7A]">Customer:</span>
                  <span className="font-bold text-[#1C241E] text-sm">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#767E7A]">Phone:</span>
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="font-mono text-[#26332A] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedOrder.customerPhone}</span>
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#767E7A]">Fulfillment:</span>
                  <span className="font-semibold text-[#755546] bg-white px-2 py-0.5 rounded border border-[#E5DFD5]">
                    {selectedOrder.orderType}
                  </span>
                </div>

                {/* CSJMU Campus Delivery Details */}
                {selectedOrder.deliveryLocation && (
                  <div className="mt-2 p-3 bg-[#E6F0EB] rounded-xl border border-[#0F3A23]/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F3A23]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0F3A23]" />
                        <span>CSJMU Campus Delivery</span>
                      </div>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${selectedOrder.deliveryLocation.lat}&mlon=${selectedOrder.deliveryLocation.lng}#map=18/${selectedOrder.deliveryLocation.lat}/${selectedOrder.deliveryLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#0F3A23] font-semibold underline hover:text-[#154D30] inline-flex items-center gap-0.5"
                      >
                        <span>View Map</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="text-xs text-[#162820] space-y-0.5">
                      <p className="font-semibold">
                        Building: {selectedOrder.deliveryLocation.building}
                      </p>
                      {selectedOrder.deliveryLocation.room && (
                        <p className="text-[11px] text-[#2F3E37]">
                          Room / Details: {selectedOrder.deliveryLocation.room}
                        </p>
                      )}
                      {selectedOrder.deliveryLocation.instructions && (
                        <p className="text-[11px] text-[#6E776F] italic">
                          Gate/Delivery Note: &ldquo;{selectedOrder.deliveryLocation.instructions}&rdquo;
                        </p>
                      )}
                      <p className="text-[10px] text-[#6E776F] font-mono pt-0.5">
                        Coords: {selectedOrder.deliveryLocation.lat.toFixed(5)}, {selectedOrder.deliveryLocation.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.note && (
                  <div className="pt-1.5 text-[11px] text-[#575E5B] italic border-t border-[#E8DFD3]">
                    Customer Note: &ldquo;{selectedOrder.note}&rdquo;
                  </div>
                )}
              </div>

              {/* Items breakdown */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755546] block mb-2">
                  Items Ordered
                </span>
                <div className="divide-y divide-[#EFE9DE] border border-[#EFE9DE] rounded-xl overflow-hidden bg-white">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#1C241E]">{i.name}</span>
                        <span className="text-[#767E7A] text-[11px] ml-1.5">×{i.quantity}</span>
                      </div>
                      <span className="font-serif font-bold text-sm text-[#1C241E]">
                        ₹{i.price * i.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Current Status Badge */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EFE9DE]">
                <div>
                  <span className="text-[10px] text-[#767E7A] uppercase tracking-wider block">Status</span>
                  <span
                    className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#767E7A] uppercase tracking-wider block">Total</span>
                  <span className="font-serif text-2xl font-bold text-[#1C241E]">
                    ₹{selectedOrder.totalAmount}
                  </span>
                </div>
              </div>

              {/* Action Buttons: CONFIRM, MARK PREPARING, MARK READY, COMPLETE, CANCEL */}
              <div className="pt-3 border-t border-[#EFE9DE]">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#755546] mb-2">
                  Update Order Workflow Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "Confirmed")}
                    className={`py-2 px-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                      selectedOrder.status === "Confirmed"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "Preparing")}
                    className={`py-2 px-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                      selectedOrder.status === "Preparing"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    Mark Preparing
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "Ready")}
                    className={`py-2 px-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                      selectedOrder.status === "Ready"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    Mark Ready
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "Completed")}
                    className={`py-2 px-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                      selectedOrder.status === "Completed"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "Cancelled")}
                    className={`py-2 px-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                      selectedOrder.status === "Cancelled"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this order record permanently?")) {
                        deleteOrder(selectedOrder.id);
                        showToast(`Order #${selectedOrder.id} deleted.`);
                        setSelectedOrder(null);
                      }
                    }}
                    className="py-2 px-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider bg-white text-stone-500 border border-stone-200 hover:bg-stone-100 cursor-pointer"
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

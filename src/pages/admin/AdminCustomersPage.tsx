import React, { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { fetchAdminCustomers, type CustomerRecord } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  ExternalLink,
  X,
  ShieldCheck,
  Building2,
  RefreshCw,
} from "lucide-react";

export const AdminCustomersPage: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const loadCustomers = async () => {
    setIsLoading(true);
    const data = await fetchAdminCustomers();
    setCustomers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    });
  }, [customers, searchQuery]);

  // Aggregate Metrics
  const totalCustomers = customers.length;
  const activeCustomersCount = customers.filter((c) => c.totalOrders > 0).length;
  const totalCombinedSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);

  return (
    <AdminLayout
      pageTitle="Registered Customers"
      pageSubtitle="Browse registered customer profiles, default campus delivery addresses, and lifetime order histories."
      actions={
        <button
          onClick={() => {
            loadCustomers();
            showToast("Customer list refreshed.");
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#162820] hover:bg-[#FAF6F0] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs border border-[#E2D9CC] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      }
    >
      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Registered Accounts
            </span>
            <span className="font-serif text-3xl font-bold text-[#1C241E]">
              {totalCustomers}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Firebase Auth Verified</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Active Buyers
            </span>
            <span className="font-serif text-3xl font-bold text-[#064F50]">
              {activeCustomersCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Placed at least 1 order</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#064F50]">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Customer Lifetime Spend
            </span>
            <span className="font-serif text-3xl font-bold text-[#C59F54]">
              ₹{totalCombinedSpend}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Across registered orders</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C59F54]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767E7A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, email, or phone number..."
            className="w-full pl-10 pr-4 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-hidden focus:border-[#0F3A23]"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#767E7A]">
            <div className="w-6 h-6 border-2 border-[#0F3A23] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading customer profiles from Firestore...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#767E7A] space-y-2">
            <Users className="w-8 h-8 text-[#A39B8E] mx-auto opacity-50" />
            <p className="font-medium text-[#1C241E]">No registered customers found.</p>
            <p className="font-light">
              Customers will automatically appear here when they register on the website.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] border-b border-[#E5DFD5] text-[#755546] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Campus Location</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Total Spend</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DE]">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.uid} className="hover:bg-[#FCFAF7] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F3A23] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                          {cust.name.charAt(0) || "C"}
                        </div>
                        <div>
                          <span className="font-semibold text-[#1C241E] block">
                            {cust.name}
                          </span>
                          <span className="text-[10px] text-[#767E7A] font-mono">
                            UID: {cust.uid.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#1C241E]">
                          <Mail className="w-3 h-3 text-[#767E7A]" />
                          <span>{cust.email || "No email"}</span>
                        </div>
                        {cust.phone && (
                          <div className="flex items-center gap-1.5 text-[#767E7A]">
                            <Phone className="w-3 h-3" />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {cust.defaultDeliveryLocation ? (
                        <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 w-fit">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">
                            {cust.defaultDeliveryLocation.building}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#A39B8E] italic">None saved</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAF6F0] border border-[#E5DFD5] font-semibold text-[#1C241E]">
                        {cust.totalOrders} {cust.totalOrders === 1 ? "order" : "orders"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#0F3A23]">
                      ₹{cust.totalSpend}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF6F0] text-[#0F3A23] border border-[#E5DFD5] text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-[#EFE9DE] flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#0F3A23] text-white flex items-center justify-center font-bold text-base uppercase">
                  {selectedCustomer.name.charAt(0) || "C"}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C241E]">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-[11px] text-[#767E7A] font-mono">
                    Firebase UID: {selectedCustomer.uid}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-[#767E7A] hover:text-[#1C241E] rounded-xl hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Contact & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#FCFAF7] rounded-xl border border-[#E5DFD5] space-y-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#755546] block">
                    Contact Information
                  </span>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-[#1C241E]">
                      <Mail className="w-3.5 h-3.5 text-[#767E7A]" />
                      <span>{selectedCustomer.email}</span>
                    </p>
                    <p className="flex items-center gap-2 text-[#1C241E]">
                      <Phone className="w-3.5 h-3.5 text-[#767E7A]" />
                      <span>{selectedCustomer.phone || "No phone provided"}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#FCFAF7] rounded-xl border border-[#E5DFD5] space-y-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#755546] block">
                    Default CSJMU Campus Location
                  </span>
                  {selectedCustomer.defaultDeliveryLocation ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{selectedCustomer.defaultDeliveryLocation.building}</span>
                      </p>
                      {selectedCustomer.defaultDeliveryLocation.room && (
                        <p className="text-[#6E776F]">
                          Room / Floor: {selectedCustomer.defaultDeliveryLocation.room}
                        </p>
                      )}
                      <p className="text-[10px] text-[#767E7A] font-mono">
                        GPS: {selectedCustomer.defaultDeliveryLocation.lat.toFixed(4)}°N,{" "}
                        {selectedCustomer.defaultDeliveryLocation.lng.toFixed(4)}°E
                      </p>
                    </div>
                  ) : (
                    <p className="text-[#767E7A] italic">No default campus location saved.</p>
                  )}
                </div>
              </div>

              {/* Order History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase font-semibold tracking-wider text-[#755546]">
                    Order History ({selectedCustomer.orders.length} orders)
                  </span>
                  <span className="font-serif font-bold text-sm text-[#0F3A23]">
                    Lifetime Spend: ₹{selectedCustomer.totalSpend}
                  </span>
                </div>

                {selectedCustomer.orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#767E7A] bg-[#FCFAF7] rounded-xl border border-[#E5DFD5]">
                    No orders placed under this customer account yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.orders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-3 bg-[#FCFAF7] rounded-xl border border-[#E5DFD5] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1C241E]">Order #{ord.id}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {ord.status}
                            </span>
                            <span className="text-[10px] text-[#767E7A]">{ord.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-[#767E7A] mt-1">
                            {Array.isArray(ord.items)
                              ? ord.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")
                              : "Items"}
                          </p>
                        </div>
                        <span className="font-serif font-bold text-sm text-[#0F3A23]">
                          ₹{ord.totalAmount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

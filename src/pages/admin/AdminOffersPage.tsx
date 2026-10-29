import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  fetchAdminOffers,
  saveOffer,
  deleteOffer,
  type OfferRecord,
} from "../../services/adminService";
import { useToast } from "../../context/ToastContext";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Percent,
  Calendar,
  X,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const AdminOffersPage: React.FC = () => {
  const { showToast } = useToast();
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(149);
  const [maxDiscount, setMaxDiscount] = useState<number>(50);
  const [validUntil, setValidUntil] = useState("2027-12-31");
  const [isActive, setIsActive] = useState(true);

  const loadOffers = async () => {
    setIsLoading(true);
    const data = await fetchAdminOffers();
    setOffers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setCode("");
    setTitle("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue(10);
    setMinOrderAmount(149);
    setMaxDiscount(50);
    setValidUntil("2027-12-31");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (off: OfferRecord) => {
    setEditingOffer(off);
    setCode(off.code);
    setTitle(off.title);
    setDescription(off.description);
    setDiscountType(off.discountType);
    setDiscountValue(off.discountValue);
    setMinOrderAmount(off.minOrderAmount || 0);
    setMaxDiscount(off.maxDiscount || 0);
    setValidUntil(off.validUntil || "2027-12-31");
    setIsActive(off.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast("Coupon code is required", "error");
      return;
    }

    const payload: Partial<OfferRecord> & { code: string } = {
      id: editingOffer?.id,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || undefined,
      maxDiscount: discountType === "percentage" ? Number(maxDiscount) || undefined : undefined,
      validUntil,
      isActive,
    };

    const saved = await saveOffer(payload);
    if (saved) {
      if (editingOffer) {
        setOffers((prev) => prev.map((o) => (o.id === saved.id ? saved : o)));
        showToast(`Coupon ${saved.code} updated.`);
      } else {
        setOffers((prev) => [saved, ...prev]);
        showToast(`New coupon ${saved.code} created.`);
      }
      setIsModalOpen(false);
    } else {
      showToast("Failed to save offer.", "error");
    }
  };

  const handleToggleActive = async (off: OfferRecord) => {
    const updated = await saveOffer({ ...off, isActive: !off.isActive });
    if (updated) {
      setOffers((prev) => prev.map((o) => (o.id === off.id ? updated : o)));
      showToast(`Coupon ${off.code} ${updated.isActive ? "activated" : "deactivated"}.`);
    }
  };

  const handleDelete = async (id: string, offerCode: string) => {
    if (confirm(`Delete coupon code ${offerCode} permanently?`)) {
      const ok = await deleteOffer(id);
      if (ok) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
        showToast(`Coupon ${offerCode} deleted.`);
      } else {
        showToast("Failed to delete coupon.", "error");
      }
    }
  };

  const totalCampaigns = offers.length;
  const activeCount = offers.filter((o) => o.isActive).length;
  const totalRedemptions = offers.reduce((sum, o) => sum + (o.usageCount || 0), 0);

  return (
    <AdminLayout
      pageTitle="Offers &amp; Coupon Codes"
      pageSubtitle="Configure promo codes, student discounts, and checkout order deductions stored in Firestore."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadOffers();
              showToast("Offers refreshed.");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#162820] hover:bg-[#FAF6F0] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs border border-[#E2D9CC] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064F50] hover:bg-[#043839] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Coupon</span>
          </button>
        </div>
      }
    >
      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Active Promo Codes
            </span>
            <span className="font-serif text-3xl font-bold text-emerald-700">
              {activeCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Available for checkout</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Total Redemptions
            </span>
            <span className="font-serif text-3xl font-bold text-[#064F50]">
              {totalRedemptions}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Orders with applied code</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#064F50]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Total Campaigns
            </span>
            <span className="font-serif text-3xl font-bold text-[#1C241E]">
              {totalCampaigns}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Created discounts</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF6F0] border border-[#E5DFD5] flex items-center justify-center text-[#26332A]">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#E5DFD5] p-12 text-center text-xs text-[#767E7A]">
            <div className="w-6 h-6 border-2 border-[#0F3A23] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading discount coupons from Firestore...
          </div>
        ) : offers.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#E5DFD5] p-12 text-center text-xs text-[#767E7A] space-y-2">
            <Tag className="w-8 h-8 text-[#A39B8E] mx-auto opacity-50" />
            <p className="font-medium text-[#1C241E]">No discount coupons configured.</p>
            <p className="font-light">
              Click "Create Coupon" above to add your first promotional offer.
            </p>
          </div>
        ) : (
          offers.map((off) => (
            <div
              key={off.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all flex flex-col justify-between ${
                off.isActive ? "border-[#E5DFD5]" : "border-stone-200 opacity-60 bg-stone-50/50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#FAF6F0] border border-[#E2D9CC] rounded-xl font-mono font-bold text-sm text-[#0F3A23] tracking-wider uppercase">
                      {off.code}
                    </span>
                    <button
                      onClick={() => handleToggleActive(off)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                        off.isActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      {off.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(off)}
                      className="p-1.5 text-[#767E7A] hover:text-[#0F3A23] hover:bg-[#FAF6F0] rounded-lg transition-colors cursor-pointer"
                      title="Edit Offer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(off.id, off.code)}
                      className="p-1.5 text-[#767E7A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-[#1C241E] mt-1">
                  {off.title}
                </h3>
                <p className="text-xs text-[#6E776F] mt-1">{off.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EFE9DE] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0F3A23]">
                    {off.discountType === "percentage"
                      ? `${off.discountValue}% OFF`
                      : `₹${off.discountValue} FLAT OFF`}
                  </span>
                  {off.minOrderAmount ? (
                    <span className="text-[11px] text-[#767E7A] block">
                      Min order: ₹{off.minOrderAmount}
                    </span>
                  ) : null}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#767E7A] block">
                    Used: {off.usageCount || 0} times
                  </span>
                  {off.validUntil && (
                    <span className="text-[10px] text-[#A39B8E] flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      <span>Till {off.validUntil}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-[#EFE9DE] flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-[#0F3A23]" />
                <h3 className="font-serif text-lg font-bold text-[#1C241E]">
                  {editingOffer ? "Edit Discount Coupon" : "Create New Coupon"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#767E7A] hover:text-[#1C241E] rounded-xl hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CRUSH20"
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] font-mono font-bold text-xs text-[#162820] uppercase focus:outline-hidden focus:border-[#0F3A23]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Campus Student Special"
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 10% off on all items above ₹149"
                  className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount Discount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder={discountType === "percentage" ? "10" : "50"}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Minimum Order Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  />
                </div>

                {discountType === "percentage" && (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Valid Until (Date)
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[#0F3A23]"
                    />
                    <span className="font-semibold text-[#162820]">Active for checkout</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE9DE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#767E7A] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#064F50] hover:bg-[#043839] text-white transition-all shadow-xs cursor-pointer"
                >
                  {editingOffer ? "Save Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

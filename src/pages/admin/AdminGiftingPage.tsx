import React, { useState, useMemo } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  useData,
  type GiftProduct,
  type GiftAddon,
  type GiftingOrderStatus,
} from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { GIFT_OCCASIONS } from "../../data/giftingData";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Star,
  Sparkles,
  Save,
} from "lucide-react";

export const AdminGiftingPage: React.FC = () => {
  const {
    giftProducts,
    addGiftProduct,
    updateGiftProduct,
    deleteGiftProduct,
    toggleGiftAvailability,
    giftCategories,
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
  } = useData();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "addons" | "orders" | "settings"
  >("products");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");

  // ------------------ GIFT PRODUCT MODAL STATE ------------------
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<GiftProduct | null>(null);

  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodTagline, setProdTagline] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodPrice, setProdPrice] = useState(499);
  const [prodPriceDisplay, setProdPriceDisplay] = useState("");
  const [prodIsPriceConfirmed, setProdIsPriceConfirmed] = useState(true);
  const [prodImage, setProdImage] = useState("");
  const [prodCategory, setProdCategory] = useState("flowers-chocolates");
  const [prodOccasions, setProdOccasions] = useState<string[]>(["Birthdays"]);
  const [prodIncludedItems, setProdIncludedItems] = useState("");
  const [prodIsAvailable, setProdIsAvailable] = useState(true);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodSupportsMsg, setProdSupportsMsg] = useState(true);
  const [prodPickup, setProdPickup] = useState(true);
  const [prodDelivery, setProdDelivery] = useState(true);
  const [prodAdvanceNotice, setProdAdvanceNotice] = useState("Order 3–4 hours in advance");

  // Delete product confirmation
  const [productToDelete, setProductToDelete] = useState<GiftProduct | null>(null);

  // ------------------ ADD-ON MODAL STATE ------------------
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<GiftAddon | null>(null);
  const [addonName, setAddonName] = useState("");
  const [addonDesc, setAddonDesc] = useState("");
  const [addonPrice, setAddonPrice] = useState(49);
  const [addonCategory, setAddonCategory] = useState<GiftAddon["category"]>("card");

  // ------------------ SETTINGS LOCAL STATE ------------------
  const [settingsEnabled, setSettingsEnabled] = useState(giftingSettings.isEnabled);
  const [settingsWa, setSettingsWa] = useState(giftingSettings.whatsappNumber);
  const [settingsPickup, setSettingsPickup] = useState(giftingSettings.pickupEnabled);
  const [settingsDelivery, setSettingsDelivery] = useState(giftingSettings.deliveryEnabled);
  const [settingsArea, setSettingsArea] = useState(giftingSettings.deliveryArea);
  const [settingsFee, setSettingsFee] = useState(giftingSettings.deliveryFee);
  const [settingsNotice, setSettingsNotice] = useState(giftingSettings.advanceOrderNotice);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return giftProducts.filter((p) => {
      const matchCat = selectedCatFilter === "all" || p.categoryId === selectedCatFilter;
      const matchSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [giftProducts, selectedCatFilter, searchQuery]);

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName("");
    setProdSlug("");
    setProdTagline("");
    setProdDescription("");
    setProdPrice(499);
    setProdPriceDisplay("₹499");
    setProdIsPriceConfirmed(true);
    setProdImage("https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1200&q=80");
    setProdCategory(giftCategories[0]?.id || "flowers-chocolates");
    setProdOccasions(["Birthdays", "Anniversaries"]);
    setProdIncludedItems("Seasonal fresh floral bouquet, Assorted chocolates (6 pcs), Handwritten card");
    setProdIsAvailable(true);
    setProdIsFeatured(false);
    setProdSupportsMsg(true);
    setProdPickup(true);
    setProdDelivery(true);
    setProdAdvanceNotice("Order 3–4 hours in advance");
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: GiftProduct) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdSlug(prod.slug);
    setProdTagline(prod.tagline || "");
    setProdDescription(prod.description);
    setProdPrice(prod.price);
    setProdPriceDisplay(prod.priceDisplay || `₹${prod.price}`);
    setProdIsPriceConfirmed(prod.isPriceConfirmed);
    setProdImage(prod.image);
    setProdCategory(prod.categoryId);
    setProdOccasions(prod.occasions || []);
    setProdIncludedItems(prod.includedItems ? prod.includedItems.join(", ") : "");
    setProdIsAvailable(prod.isAvailable);
    setProdIsFeatured(prod.isFeatured || false);
    setProdSupportsMsg(prod.supportsPersonalMessage);
    setProdPickup(prod.pickupEnabled);
    setProdDelivery(prod.deliveryEnabled);
    setProdAdvanceNotice(prod.advanceNotice || "");
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const includedArray = prodIncludedItems
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const slug = prodSlug.trim() || prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingProduct) {
      updateGiftProduct({
        ...editingProduct,
        name: prodName.trim(),
        slug,
        tagline: prodTagline.trim() || undefined,
        description: prodDescription.trim(),
        price: Number(prodPrice),
        priceDisplay: prodPriceDisplay.trim() || `₹${prodPrice}`,
        isPriceConfirmed: prodIsPriceConfirmed,
        image: prodImage.trim() || editingProduct.image,
        categoryId: prodCategory,
        occasions: prodOccasions,
        includedItems: includedArray,
        isAvailable: prodIsAvailable,
        isFeatured: prodIsFeatured,
        supportsPersonalMessage: prodSupportsMsg,
        pickupEnabled: prodPickup,
        deliveryEnabled: prodDelivery,
        advanceNotice: prodAdvanceNotice.trim() || undefined,
      });
      showToast(`"${prodName}" updated successfully.`);
    } else {
      addGiftProduct({
        name: prodName.trim(),
        slug,
        tagline: prodTagline.trim() || undefined,
        description: prodDescription.trim(),
        price: Number(prodPrice),
        priceDisplay: prodPriceDisplay.trim() || `₹${prodPrice}`,
        isPriceConfirmed: prodIsPriceConfirmed,
        image:
          prodImage.trim() ||
          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
        categoryId: prodCategory,
        occasions: prodOccasions,
        includedItems: includedArray,
        isAvailable: prodIsAvailable,
        isFeatured: prodIsFeatured,
        supportsPersonalMessage: prodSupportsMsg,
        pickupEnabled: prodPickup,
        deliveryEnabled: prodDelivery,
        advanceNotice: prodAdvanceNotice.trim() || undefined,
        sortOrder: giftProducts.length + 1,
      });
      showToast(`"${prodName}" added to gifting collection.`);
    }

    setIsProductModalOpen(false);
  };

  // Toggle occasion in form
  const toggleOccasionInForm = (occ: string) => {
    setProdOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  // Save Addon
  const handleSaveAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonName.trim()) return;

    if (editingAddon) {
      updateGiftAddon({
        ...editingAddon,
        name: addonName.trim(),
        description: addonDesc.trim(),
        price: Number(addonPrice),
        category: addonCategory,
      });
      showToast(`Add-on "${addonName}" updated.`);
    } else {
      addGiftAddon({
        name: addonName.trim(),
        description: addonDesc.trim(),
        price: Number(addonPrice),
        isAvailable: true,
        category: addonCategory,
      });
      showToast(`Add-on "${addonName}" added.`);
    }

    setIsAddonModalOpen(false);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateGiftingSettings({
      isEnabled: settingsEnabled,
      whatsappNumber: settingsWa.trim().replace(/[^0-9]/g, ""),
      pickupEnabled: settingsPickup,
      deliveryEnabled: settingsDelivery,
      deliveryArea: settingsArea.trim(),
      deliveryFee: Number(settingsFee),
      advanceOrderNotice: settingsNotice.trim(),
    });
    showToast("Gifting settings saved!");
  };

  // Simulate Test Gifting Order
  const handleSimulateOrder = () => {
    const sampleNames = ["Divya Nair", "Kunal Singhania", "Pooja Malhotra"];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomProduct = giftProducts[Math.floor(Math.random() * giftProducts.length)];

    addGiftingOrder({
      customerName: randomName,
      customerPhone: "+91 98888 " + Math.floor(10000 + Math.random() * 90000),
      recipientName: "Bestie " + randomName.split(" ")[0],
      giftItems: [
        {
          giftId: randomProduct.id,
          name: randomProduct.name,
          price: randomProduct.price,
          quantity: 1,
          addons: ["Handwritten Calligraphy Card"],
          personalMessage: "Wishing you the sweetest day ahead!",
        },
      ],
      fulfilmentMethod: "Delivery",
      deliveryAddress: "Apartment 102, Sunrise Residency, Sector 4",
      requestedDate: "Today",
      requestedTime: "6:00 PM",
      subtotal: randomProduct.price + 49,
      deliveryFee: 49,
      total: randomProduct.price + 49 + 49,
      status: "Pending Confirmation",
      note: "Simulated test order",
    });
    showToast("Test gifting order created!");
  };

  return (
    <AdminLayout
      pageTitle="Gifting Management"
      pageSubtitle="Curate gift bundles, flowers & chocolates, add-ons and orders"
      actions={
        <div className="flex items-center gap-2">
          {activeTab === "products" && (
            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-2 bg-[#26332A] text-white hover:bg-[#1C241E] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gift</span>
            </button>
          )}

          {activeTab === "orders" && (
            <button
              onClick={handleSimulateOrder}
              className="px-3 py-1.5 bg-[#FAF7F2] text-[#1C241E] border border-[#E8DFD3] hover:bg-[#EFE9DE] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8C4A52]" />
              <span>Simulate Order</span>
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#E5DFD5] pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-[#1C241E] text-white"
                : "text-[#59605C] hover:bg-white"
            }`}
          >
            All Gifts ({giftProducts.length})
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-[#1C241E] text-white"
                : "text-[#59605C] hover:bg-white"
            }`}
          >
            Categories ({giftCategories.length})
          </button>

          <button
            onClick={() => setActiveTab("addons")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "addons"
                ? "bg-[#1C241E] text-white"
                : "text-[#59605C] hover:bg-white"
            }`}
          >
            Add-ons ({giftAddons.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-[#1C241E] text-white"
                : "text-[#59605C] hover:bg-white"
            }`}
          >
            <span>Gifting Orders</span>
            {giftingOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#8C4A52] text-white text-[10px] flex items-center justify-center font-bold">
                {giftingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#1C241E] text-white"
                : "text-[#59605C] hover:bg-white"
            }`}
          >
            Gifting Settings
          </button>
        </div>

        {/* ----------------- TAB 1: ALL GIFTS ----------------- */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5DFD5]">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#767E7A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search gifts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-[#1C241E]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCatFilter}
                  onChange={(e) => setSelectedCatFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-[#1C241E] cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {giftCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#E5DFD5] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EFE9DE] bg-[#FAF7F2] text-[10px] uppercase tracking-wider font-semibold text-[#755546]">
                      <th className="py-3 px-4">Gift</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4">Fulfilment</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE1] text-xs">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FCFAF7] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-[#E8DFD3]"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-serif font-bold text-sm text-[#1C241E]">
                                  {p.name}
                                </h4>
                                {p.isFeatured && (
                                  <Star className="w-3.5 h-3.5 fill-[#D8B774] text-[#D8B774]" />
                                )}
                              </div>
                              <p className="text-[10px] text-[#767E7A] line-clamp-1 max-w-xs font-light">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E5DFD5] text-[10px] font-medium text-[#755546]">
                            {giftCategories.find((c) => c.id === p.categoryId)?.name ||
                              p.categoryId}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-serif font-bold text-[#1C241E]">
                          {p.isPriceConfirmed ? (
                            `₹${p.price}`
                          ) : (
                            <span className="text-[10px] text-[#767E7A] font-sans font-normal">
                              To be confirmed
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleGiftAvailability(p.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                              p.isAvailable
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {p.isAvailable ? "Available" : "Sold Out"}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-[11px] text-[#767E7A]">
                          <div className="flex items-center gap-1">
                            {p.pickupEnabled && (
                              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-[9px] uppercase font-semibold">
                                Pickup
                              </span>
                            )}
                            {p.deliveryEnabled && (
                              <span className="px-1.5 py-0.5 rounded bg-[#F5E6E6] text-[#8C4A52] text-[9px] uppercase font-semibold">
                                Delivery
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-[#59605C] hover:text-[#1C241E] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer mr-1"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: CATEGORIES ----------------- */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {giftCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-[#E5DFD5] p-4 flex gap-3 shadow-2xs"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E8DFD3]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-sm text-[#1C241E]">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-[#767E7A] line-clamp-2 mt-0.5 font-light">
                    {cat.description}
                  </p>
                  <span className="text-[9px] uppercase font-semibold text-[#8C4A52] tracking-wider mt-1 block">
                    Slug: {cat.slug}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ----------------- TAB 3: ADD-ONS ----------------- */}
        {activeTab === "addons" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingAddon(null);
                  setAddonName("");
                  setAddonDesc("");
                  setAddonPrice(49);
                  setAddonCategory("card");
                  setIsAddonModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#26332A] text-white hover:bg-[#1C241E] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Add-on</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5DFD5] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EFE9DE] bg-[#FAF7F2] text-[10px] uppercase tracking-wider font-semibold text-[#755546]">
                    <th className="py-3 px-4">Add-on</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE1] text-xs">
                  {giftAddons.map((addon) => (
                    <tr key={addon.id} className="hover:bg-[#FCFAF7]">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#1C241E] block">
                          {addon.name}
                        </span>
                        <span className="text-[11px] text-[#767E7A] font-light">
                          {addon.description}
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] text-[#755546] font-semibold">
                        {addon.category}
                      </td>
                      <td className="py-3 px-4 font-serif font-bold text-[#1C241E]">
                        ₹{addon.price}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleAddonAvailability(addon.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase cursor-pointer ${
                            addon.isAvailable
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {addon.isAvailable ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingAddon(addon);
                            setAddonName(addon.name);
                            setAddonDesc(addon.description);
                            setAddonPrice(addon.price);
                            setAddonCategory(addon.category);
                            setIsAddonModalOpen(true);
                          }}
                          className="p-1 text-[#59605C] hover:text-[#1C241E] mr-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGiftAddon(addon.id)}
                          className="p-1 text-[#9CA3AF] hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: GIFTING ORDERS ----------------- */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-[#E5DFD5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EFE9DE] bg-[#FAF7F2] text-[10px] uppercase tracking-wider font-semibold text-[#755546]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Gift Items</th>
                    <th className="py-3 px-4">Fulfilment</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE1] text-xs">
                  {giftingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#767E7A]">
                        No gifting orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    giftingOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#FCFAF7]">
                        <td className="py-3 px-4 font-mono font-bold text-[#1C241E]">
                          #{ord.id}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold block text-[#1C241E]">
                            {ord.customerName}
                          </span>
                          <span className="text-[10px] text-[#767E7A]">
                            {ord.customerPhone}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#755546]">
                          {ord.recipientName || "Self / Unspecified"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {ord.giftItems.map((gi, idx) => (
                              <div key={idx} className="text-[11px] text-[#1C241E]">
                                <span className="font-semibold">{gi.name}</span>
                                {gi.personalMessage && (
                                  <p className="text-[10px] text-[#8C4A52] font-serif italic truncate">
                                    &ldquo;{gi.personalMessage}&rdquo;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DFD5] text-[10px] uppercase font-semibold text-[#755546]">
                            {ord.fulfilmentMethod}
                          </span>
                          <span className="block text-[10px] text-[#767E7A] mt-0.5">
                            {ord.requestedDate}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-serif font-bold text-[#1C241E]">
                          ₹{ord.total}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                updateGiftingOrderStatus(
                                  ord.id,
                                  e.target.value as GiftingOrderStatus
                                )
                              }
                              className="text-[10px] px-2 py-1 rounded-lg border border-[#E5DFD5] bg-[#FCFAF7] font-semibold text-[#1C241E] cursor-pointer"
                            >
                              <option value="Pending Confirmation">
                                Pending Confirmation
                              </option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Ready for Pickup">Ready for Pickup</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => {
                                deleteGiftingOrder(ord.id);
                                showToast(`Order #${ord.id} removed.`);
                              }}
                              className="p-1 text-[#9CA3AF] hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Delete order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- TAB 5: SETTINGS ----------------- */}
        {activeTab === "settings" && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-2xl border border-[#E5DFD5] p-6 max-w-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1C241E]">
                  Gifting Module Settings
                </h3>
                <p className="text-xs text-[#767E7A] font-light">
                  Configure WhatsApp order forwarding and fulfilment policies
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Enabled toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] cursor-pointer">
                <div>
                  <span className="font-bold text-[#1C241E] block">
                    Gifting Section Active on Website
                  </span>
                  <span className="text-[10px] text-[#767E7A]">
                    Enable or disable the /gifting pages for visitors
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsEnabled}
                  onChange={(e) => setSettingsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#26332A]"
                />
              </label>

              {/* WhatsApp Number */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Business WhatsApp Number (without &lsquo;+&rsquo;)
                </label>
                <input
                  type="text"
                  value={settingsWa}
                  onChange={(e) => setSettingsWa(e.target.value)}
                  placeholder="918090205081"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] bg-[#FCFAF7] text-xs text-[#1C241E]"
                />
              </div>

              {/* Pickup & Delivery Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] cursor-pointer">
                  <span className="font-semibold text-[#1C241E]">
                    Pickup Available
                  </span>
                  <input
                    type="checkbox"
                    checked={settingsPickup}
                    onChange={(e) => setSettingsPickup(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] cursor-pointer">
                  <span className="font-semibold text-[#1C241E]">
                    Delivery Available
                  </span>
                  <input
                    type="checkbox"
                    checked={settingsDelivery}
                    onChange={(e) => setSettingsDelivery(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A]"
                  />
                </label>
              </div>

              {/* Delivery Fee & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsFee}
                    onChange={(e) => setSettingsFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] bg-[#FCFAF7] text-xs text-[#1C241E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Delivery Coverage Area
                  </label>
                  <input
                    type="text"
                    value={settingsArea}
                    onChange={(e) => setSettingsArea(e.target.value)}
                    placeholder="e.g. Within 5 km radius"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] bg-[#FCFAF7] text-xs text-[#1C241E]"
                  />
                </div>
              </div>

              {/* Advance Notice */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Advance Order Notice Text
                </label>
                <textarea
                  rows={2}
                  value={settingsNotice}
                  onChange={(e) => setSettingsNotice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] bg-[#FCFAF7] text-xs text-[#1C241E]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1C241E] text-white hover:bg-[#26332A] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Gifting Settings</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ----------------- ADD / EDIT PRODUCT MODAL ----------------- */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E5DFD5] p-6 sm:p-8 animate-in fade-in zoom-in-95 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DE]">
              <h3 className="font-serif text-xl font-bold text-[#1C241E]">
                {editingProduct ? `Edit "${editingProduct.name}"` : "Add New Gift Bundle"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#767E7A] hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Gift Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Petals & Cocoa"
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    placeholder="petals-and-cocoa"
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Tagline / Short Hook
                </label>
                <input
                  type="text"
                  value={prodTagline}
                  onChange={(e) => setProdTagline(e.target.value)}
                  placeholder="Fresh flowers paired with cafe chocolates"
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Atmospheric description of the gift experience..."
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Price Display Label
                  </label>
                  <input
                    type="text"
                    value={prodPriceDisplay}
                    onChange={(e) => setProdPriceDisplay(e.target.value)}
                    placeholder="₹499"
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Category *
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  >
                    {giftCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL & preview */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Product Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
                {prodImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={prodImage}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-[#E8DFD3]"
                    />
                    <span className="text-[10px] text-[#767E7A]">Image Preview</span>
                  </div>
                )}
              </div>

              {/* What's Included */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Included Items (Comma-separated)
                </label>
                <input
                  type="text"
                  value={prodIncludedItems}
                  onChange={(e) => setProdIncludedItems(e.target.value)}
                  placeholder="Fresh flowers, 4x Brownies, Handwritten Card"
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              {/* Occasions Checkboxes */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Applicable Occasions:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GIFT_OCCASIONS.map((occ) => {
                    const isChecked = prodOccasions.includes(occ);
                    return (
                      <button
                        type="button"
                        key={occ}
                        onClick={() => toggleOccasionInForm(occ)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                          isChecked
                            ? "bg-[#8C4A52] text-white border-[#8C4A52]"
                            : "bg-[#FAF7F2] text-[#59605C] border-[#E8DFD3]"
                        }`}
                      >
                        {occ}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F2ECE1]">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsAvailable}
                    onChange={(e) => setProdIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A]"
                  />
                  <span className="font-semibold text-[#1C241E]">Available to Order</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A]"
                  />
                  <span className="font-semibold text-[#1C241E]">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodSupportsMsg}
                    onChange={(e) => setProdSupportsMsg(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A]"
                  />
                  <span className="font-semibold text-[#1C241E]">Personal Note Card</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodDelivery}
                    onChange={(e) => setProdDelivery(e.target.checked)}
                    className="w-4 h-4 rounded text-[#26332A]"
                  />
                  <span className="font-semibold text-[#1C241E]">Delivery Eligible</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#EFE9DE]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#D5C7B5] rounded-xl text-xs font-semibold uppercase tracking-wider text-[#575E5B] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C241E] text-white hover:bg-[#26332A] rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Save Gift Bundle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- ADD / EDIT ADD-ON MODAL ----------------- */}
      {isAddonModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsAddonModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-[#E5DFD5] p-6 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DE]">
              <h3 className="font-serif text-lg font-bold text-[#1C241E]">
                {editingAddon ? "Edit Add-on" : "Add New Add-on"}
              </h3>
              <button
                onClick={() => setIsAddonModalOpen(false)}
                className="text-[#767E7A] hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddon} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Add-on Name *
                </label>
                <input
                  type="text"
                  required
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                  placeholder="e.g. Extra Belgian Brownie"
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={addonDesc}
                  onChange={(e) => setAddonDesc(e.target.value)}
                  placeholder="Short note about this extra"
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={addonPrice}
                    onChange={(e) => setAddonPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#755546] mb-1">
                    Category
                  </label>
                  <select
                    value={addonCategory}
                    onChange={(e) =>
                      setAddonCategory(e.target.value as GiftAddon["category"])
                    }
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  >
                    <option value="card">Card / Note</option>
                    <option value="dessert">Bakery Dessert</option>
                    <option value="chocolate">Chocolate</option>
                    <option value="flowers">Flowers</option>
                    <option value="candle">Candle</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#EFE9DE]">
                <button
                  type="button"
                  onClick={() => setIsAddonModalOpen(false)}
                  className="px-3 py-1.5 border border-[#D5C7B5] rounded-xl text-xs font-semibold text-[#575E5B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#1C241E] text-white rounded-xl text-xs font-semibold"
                >
                  Save Add-on
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- DELETE PRODUCT CONFIRMATION MODAL ----------------- */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setProductToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-[#E5DFD5] p-6 text-center animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1C241E]">
              Delete &ldquo;{productToDelete.name}&rdquo;?
            </h3>
            <p className="text-xs text-[#767E7A] mt-1 mb-5 font-light">
              This will remove this gift bundle from the website. You can recreate it anytime.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-[#D5C7B5] rounded-xl text-xs font-semibold uppercase tracking-wider text-[#575E5B]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteGiftProduct(productToDelete.id);
                  showToast(`"${productToDelete.name}" deleted.`);
                  setProductToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

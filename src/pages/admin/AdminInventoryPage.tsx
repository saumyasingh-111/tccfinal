import React, { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData } from "../../context/DataContext";
import {
  fetchInventoryItems,
  saveInventoryItem,
  adjustInventoryStock,
  deleteInventoryItem,
  type InventoryItem,
} from "../../services/adminService";
import { useToast } from "../../context/ToastContext";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
} from "lucide-react";

export const AdminInventoryPage: React.FC = () => {
  const { menuItems, toggleItemAvailability } = useData();
  const { showToast } = useToast();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Baking");
  const [linkedProductId, setLinkedProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState("kg");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  const categories = ["All", "Baking", "Dairy", "Beverages", "Packaging", "Kitchen"];
  const unitOptions = ["kg", "loaves", "portions", "pcs", "liters", "boxes"];

  const loadInventory = async () => {
    setIsLoading(true);
    const items = await fetchInventoryItems();
    setInventory(items);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName("");
    setCategory("Baking");
    setLinkedProductId("");
    setQuantity(10);
    setUnit("kg");
    setLowStockThreshold(5);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setLinkedProductId(item.linkedProductId || "");
    setQuantity(item.quantity);
    setUnit(item.unit);
    setLowStockThreshold(item.lowStockThreshold);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter an item name", "error");
      return;
    }

    const payload: Partial<InventoryItem> & { name: string; quantity: number } = {
      id: editingItem?.id,
      name: name.trim(),
      category,
      linkedProductId: linkedProductId || undefined,
      quantity: Number(quantity),
      unit,
      lowStockThreshold: Number(lowStockThreshold),
    };

    const saved = await saveInventoryItem(payload);
    if (saved) {
      if (editingItem) {
        setInventory((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
        showToast(`Inventory item "${saved.name}" updated.`);
      } else {
        setInventory((prev) => [...prev, saved]);
        showToast(`New inventory item "${saved.name}" added.`);
      }
      setIsModalOpen(false);
    } else {
      showToast("Failed to save inventory item.", "error");
    }
  };

  const handleQuickAdjust = async (id: string, delta: number) => {
    const updated = await adjustInventoryStock(id, delta);
    if (updated) {
      setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
      showToast(`Stock for ${updated.name} updated to ${updated.quantity} ${updated.unit}.`);

      // If out of stock and linked to a menu item, auto-disable menu availability
      if (updated.quantity <= 0 && updated.linkedProductId) {
        const linkedMenu = menuItems.find((m) => m.id === updated.linkedProductId);
        if (linkedMenu && linkedMenu.isAvailable !== false) {
          toggleItemAvailability(updated.linkedProductId);
          showToast(`Menu item "${linkedMenu.name}" automatically marked Sold Out.`);
        }
      }
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}" from inventory?`)) {
      const ok = await deleteInventoryItem(id);
      if (ok) {
        setInventory((prev) => prev.filter((i) => i.id !== id));
        showToast(`Deleted ${itemName}.`);
      } else {
        showToast("Failed to delete inventory item.", "error");
      }
    }
  };

  // Filtered List
  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [inventory, selectedCategory, searchQuery]);

  // KPIs
  const totalCount = inventory.length;
  const outOfStockCount = inventory.filter((i) => i.quantity <= 0 || i.status === "Out of Stock").length;
  const lowStockCount = inventory.filter(
    (i) => i.quantity > 0 && (i.quantity <= i.lowStockThreshold || i.status === "Low Stock")
  ).length;
  const healthyCount = totalCount - outOfStockCount - lowStockCount;

  return (
    <AdminLayout
      pageTitle="Inventory &amp; Stock Tracking"
      pageSubtitle="Track cafe ingredients, packaging supplies, and automate menu item availability."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadInventory();
              showToast("Inventory refreshed.");
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
            <span>Add Stock Item</span>
          </button>
        </div>
      }
    >
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Total Stock Items
            </span>
            <span className="font-serif text-3xl font-bold text-[#1C241E]">
              {totalCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Ingredients &amp; Packaging</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF6F0] border border-[#E5DFD5] flex items-center justify-center text-[#26332A]">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Healthy Stock
            </span>
            <span className="font-serif text-3xl font-bold text-emerald-700">
              {healthyCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Above minimum threshold</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block mb-1">
              Low Stock Alert
            </span>
            <span className="font-serif text-3xl font-bold text-amber-700">
              {lowStockCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Reorder recommended</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800 block mb-1">
              Out of Stock
            </span>
            <span className="font-serif text-3xl font-bold text-rose-700">
              {outOfStockCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Immediate action needed</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar: Categories & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 w-full sm:w-auto py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#0F3A23] text-white shadow-2xs"
                    : "bg-[#FAF6F0] text-[#755546] hover:bg-[#EFE9DE]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#767E7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stock item..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E] focus:outline-hidden focus:border-[#0F3A23]"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#767E7A]">
            <div className="w-6 h-6 border-2 border-[#0F3A23] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading stock records from Firestore...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#767E7A] space-y-2">
            <Package className="w-8 h-8 text-[#A39B8E] mx-auto opacity-50" />
            <p className="font-medium text-[#1C241E]">No stock items found.</p>
            <p className="font-light">
              Add your first inventory supply item or ingredient using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F0] border-b border-[#E5DFD5] text-[#755546] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Supply / Ingredient</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Linked Menu Dish</th>
                  <th className="py-3.5 px-4">In Stock Quantity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Quick Adjust</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DE]">
                {filteredItems.map((item) => {
                  const linkedMenu = menuItems.find((m) => m.id === item.linkedProductId);

                  let badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  if (item.quantity <= 0 || item.status === "Out of Stock") {
                    badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
                  } else if (item.quantity <= item.lowStockThreshold || item.status === "Low Stock") {
                    badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                  }

                  return (
                    <tr key={item.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div>
                          <span className="font-semibold text-[#1C241E] block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[#767E7A] font-mono">
                            ID: {item.id}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-[#FAF6F0] border border-[#E5DFD5] text-[11px] text-[#755546]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {linkedMenu ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1C241E]">{linkedMenu.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                linkedMenu.isAvailable !== false
                                  ? "text-emerald-700 bg-emerald-50"
                                  : "text-rose-700 bg-rose-50"
                              }`}
                            >
                              {linkedMenu.isAvailable !== false ? "Live" : "Sold Out"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#A39B8E] italic">General Supply</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-serif font-bold text-base text-[#1C241E]">
                          {item.quantity}
                        </span>{" "}
                        <span className="text-[11px] text-[#767E7A] font-mono">{item.unit}</span>
                        <span className="text-[10px] text-[#A39B8E] block">
                          Min alert at {item.lowStockThreshold} {item.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}
                        >
                          {item.quantity <= 0
                            ? "Out of Stock"
                            : item.quantity <= item.lowStockThreshold
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#E5DFD5]">
                          <button
                            onClick={() => handleQuickAdjust(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-stone-100 text-[#1C241E] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer border border-[#E5DFD5]"
                            title="Deduct 1"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold px-2 text-[#1C241E]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuickAdjust(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-stone-100 text-[#1C241E] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer border border-[#E5DFD5]"
                            title="Add 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-[#767E7A] hover:text-[#0F3A23] hover:bg-white transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 rounded-lg text-[#767E7A] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-[#EFE9DE] flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#0F3A23]" />
                <h3 className="font-serif text-lg font-bold text-[#1C241E]">
                  {editingItem ? "Edit Inventory Item" : "Add New Stock Item"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#767E7A] hover:text-[#1C241E] rounded-xl hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                  Item / Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Belgian Dark Chocolate Ganache"
                  className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Supply Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Linked Menu Item (Optional)
                  </label>
                  <select
                    value={linkedProductId}
                    onChange={(e) => setLinkedProductId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  >
                    <option value="">-- General Supply / None --</option>
                    {menuItems.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Current Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#162820] mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                  />
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
                  {editingItem ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

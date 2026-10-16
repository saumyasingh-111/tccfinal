import { useState, useMemo } from "react";
import { MENU_CATEGORIES, MENU_ITEMS, type MenuCategoryId, type MenuItem } from "../data/menuData";
import { VegBadge } from "./VegBadge";
import { useOrder } from "../context/OrderContext";
import { Search, Plus, Minus, Sparkles } from "lucide-react";

export const MenuSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem, updateQuantity, items: orderItems } = useOrder();

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const getItemQuantity = (id: string) => {
    const found = orderItems.find((i) => i.item.id === id);
    return found ? found.quantity : 0;
  };

  const currentCategoryObj = MENU_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <section id="menu" className="py-20 sm:py-28 bg-[#FBF9F5] scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#755546] block mb-2">
            The Full Spread
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#1C241E] tracking-tight">
            OUR MENU
          </h2>
          <div className="w-12 h-0.5 bg-[#C59F54] mx-auto mt-4 mb-4" />
          <p className="font-serif italic text-base sm:text-xl text-[#59605C]">
            &ldquo;Something sweet, something savoury, something for everyone.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-[#767E7A] mt-2 font-light">
            All items are 100% vegetarian. Prepared fresh to order with love.
          </p>
        </div>

        {/* Search Bar & Category Navigation Controls */}
        <div className="max-w-4xl mx-auto mb-10 space-y-6">
          {/* Minimal Search Bar */}
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search dishes (e.g. momos, pizza, cold coffee, brownie)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5DBCA] rounded-full text-sm text-[#1C241E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#26332A]/20 focus:border-[#26332A] transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#767E7A] hover:text-[#1C241E] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips with Smooth Horizontal Scrolling */}
          <div className="overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 min-w-max px-2">
              {MENU_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#26332A] text-[#FAF7F2] shadow-xs scale-102"
                        : "bg-white text-[#575E5B] hover:text-[#1C241E] hover:bg-[#EFE9DE] border border-[#E8DFD3]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Description Subtitle if active */}
          {currentCategoryObj?.description && activeCategory !== "all" && (
            <p className="text-center text-xs sm:text-sm text-[#755546] font-medium tracking-wide">
              {currentCategoryObj.description}
            </p>
          )}
        </div>

        {/* Menu Items Grid: Clean 2-column desktop grid & 1-column mobile */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-[#E8DFD3] max-w-lg mx-auto">
            <p className="font-serif text-xl text-[#3E4340] mb-2">No matching dishes found</p>
            <p className="text-sm text-[#767E7A] mb-4">
              Try searching for something else like &ldquo;chocolate&rdquo;, &ldquo;paneer&rdquo;, or &ldquo;shake&rdquo;
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="text-xs font-semibold uppercase tracking-wider text-[#26332A] underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {filteredItems.map((item: MenuItem) => {
              const qty = getItemQuantity(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-[#E8DFD3] transition-all duration-300 hover:shadow-md hover:border-[#D5C7B5] flex gap-4 sm:gap-5 items-center group"
                >
                  {/* Item Image with Fallback */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-[#EFE9DE]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-2xs p-1 rounded">
                      <VegBadge size="sm" />
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C241E] leading-snug">
                            {item.name}
                          </h3>
                          {item.isBestseller && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
                              <Sparkles className="w-2.5 h-2.5" />
                              Bestseller
                            </span>
                          )}
                        </div>

                        <span className="font-serif text-base sm:text-lg font-bold text-[#1C241E] shrink-0">
                          {item.priceDisplay || `₹${item.price}`}
                        </span>
                      </div>

                      <p className="text-xs text-[#575E5B] mt-1 line-clamp-2 font-light leading-relaxed">
                        {item.description}
                      </p>

                      {item.prepNote && (
                        <span className="inline-block text-[10px] text-[#755546] font-medium tracking-wide mt-1">
                          • {item.prepNote}
                        </span>
                      )}
                    </div>

                    {/* Quick Add / Quantity Stepper */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-[#8C938E] font-medium">
                        100% Veg
                      </span>

                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#F7F3EC] hover:bg-[#26332A] text-[#26332A] hover:text-white rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border border-[#E5DBCA]"
                          aria-label={`Add ${item.name} to order`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-[#26332A] text-white px-2 py-1 rounded-full text-xs font-bold shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-0.5 hover:text-[#D8B774] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-3 text-center">{qty}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-0.5 hover:text-[#D8B774] cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info note about ordering */}
        <div className="mt-14 max-w-xl mx-auto text-center bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl p-5">
          <p className="text-xs sm:text-sm text-[#3E4340] font-medium">
            Planning a birthday, college treat, or bulk party order?
          </p>
          <p className="text-xs text-[#755546] mt-1 font-light">
            We take custom cake & party bite orders directly on WhatsApp with at least 4 hours advance notice!
          </p>
        </div>
      </div>
    </section>
  );
};

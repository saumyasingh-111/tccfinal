import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { type MenuCategoryId, type MenuItem } from "../data/menuData";
import { VegBadge } from "../components/VegBadge";
import { BotanicalSprig } from "../components/BotanicalSprig";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";
import { useOrder } from "../context/OrderContext";
import { useData } from "../context/DataContext";
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Star,
  Trash2,
  UtensilsCrossed,
  Cake,
  Coffee,
  Sandwich,
  Check,
} from "lucide-react";

export const MenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get("category") as MenuCategoryId) || "all";

  const { menuItems, categories } = useData();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryId | "all">(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem, updateQuantity, removeItem, items: orderItems, totalCount, totalAmount, openDrawer } = useOrder();

  // Keep state in sync with URL parameter if it changes
  useEffect(() => {
    const cat = searchParams.get("category") as MenuCategoryId;
    if (cat && categories.some((c) => c.id === cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams, categories]);

  const handleSelectCategory = (catId: MenuCategoryId | "all") => {
    setSelectedCategory(catId);
    if (catId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catId);
    }
    setSearchParams(searchParams);
  };

  const getItemQuantity = (id: string) => {
    const found = orderItems.find((i) => i.item.id === id);
    return found ? found.quantity : 0;
  };

  // Filtered categories
  const activeCategories = useMemo(() => {
    if (selectedCategory === "all") {
      return categories.filter((c) => c.id !== "all");
    }
    return categories.filter((c) => c.id === selectedCategory);
  }, [categories, selectedCategory]);

  const matchesSearch = (item: MenuItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  };

  // Curated favourites for "SOME FAVOURITES" horizontal strip (Page 4 top)
  const favouriteItems = useMemo(() => {
    return menuItems.filter((i) => i.isAvailable !== false).slice(0, 4);
  }, [menuItems]);

  const deliveryFee = totalAmount > 0 ? 40 : 0;
  const grandTotal = totalAmount + deliveryFee;

  return (
    <div className="bg-[#F5EFEB] text-[#162820]">
      {/* ==================================================
          1. TOP INVITATION BANNER (Matching PDF Page 3 top)
          ================================================== */}
      <div className="bg-[#FAF6F0] border-b border-[#E2D9CC] py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <BotanicalSprig side="left" />
            <span className="font-serif italic text-[#162820]/90 tracking-wide text-xs sm:text-sm">
              <span className="font-sans font-semibold uppercase tracking-[0.2em] text-[#6E776F] not-italic text-[10px] mr-2">
                BE A PART OF OUR STORY
              </span>
              Come for the Food, Stay for the Vibe.
            </span>
          </div>

          <Link
            to="/visit-us"
            className="px-4 py-1.5 rounded-full border border-[#0F3A23] text-[#0F3A23] hover:bg-[#0F3A23] hover:text-[#FAF6F0] text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 shrink-0"
          >
            Visit Us
          </Link>
        </div>
      </div>

      {/* ==================================================
          2. MENU HERO (Matching PDF Page 3)
          ================================================== */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Heading & Tags */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.34em] uppercase text-[#6E776F] block">
                OUR MENU
              </span>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[72px] font-bold text-[#0F3A23] tracking-tight leading-[1.05]">
                Good Food<br />
                <span className="italic font-bold">for Every Mood.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#162820]/80 font-light leading-relaxed max-w-lg">
                From freshly baked desserts to comforting sandwiches, refreshing beverages and more — explore a menu made with love, for better days.
              </p>

              {/* Three Pill Badges (matching PDF Page 3) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="px-3.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E2D9CC] text-[10px] font-bold tracking-[0.2em] uppercase text-[#0F3A23]">
                  GOOD FOOD
                </span>
                <span className="px-3.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E2D9CC] text-[10px] font-bold tracking-[0.2em] uppercase text-[#0F3A23]">
                  GREAT COFFEE
                </span>
                <span className="px-3.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E2D9CC] text-[10px] font-bold tracking-[0.2em] uppercase text-[#0F3A23]">
                  BETTER DAYS
                </span>
              </div>
            </div>

            {/* Right Column: Arched Croissant & Coffee Photo Cutout (matching PDF Page 3) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#082118] w-full max-w-sm aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80"
                  alt="Fresh buttery croissant and signature Classic Crush latte"
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-104"
                  loading="eager"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <VegBadge size="sm" />
                    <span>100% Pure Vegetarian</span>
                  </div>
                  <span className="text-[10px] text-[#D4A359] font-medium uppercase tracking-wider">
                    Fresh Daily
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. CATEGORY PILL NAVIGATION BAR & SEARCH (Matching PDF Pages 3 & 6)
          ================================================== */}
      <section className="sticky top-18 sm:top-20 z-30 bg-[#F5EFEB]/95 backdrop-blur-md border-y border-[#E2D9CC] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Horizontal Category Chips */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-0.5">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id as MenuCategoryId | "all")}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#0F3A23] text-[#FAF6F0] shadow-sm"
                      : "bg-[#FAF6F0] text-[#162820] hover:text-[#0F3A23] hover:bg-[#E8DFD1] border border-[#E2D9CC]"
                  }`}
                >
                  {cat.id === "all" && <UtensilsCrossed className="w-3.5 h-3.5" />}
                  {cat.id === "signature-desserts" && <Cake className="w-3.5 h-3.5" />}
                  {cat.id === "beverages" && <Coffee className="w-3.5 h-3.5" />}
                  {cat.id === "sandwiches-maggie" && <Sandwich className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input with Search Icon */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Search dishes, drinks, treats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-full text-xs text-[#162820] placeholder-[#6E776F] border border-[#E2D9CC] focus:outline-hidden focus:border-[#0F3A23] focus:ring-1 focus:ring-[#0F3A23]"
            />
            <Search className="w-3.5 h-3.5 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      {/* ==================================================
          4. "SOME FAVOURITES — OUR MOST-LOVED TREATS" (Matching PDF Page 4 Top)
          ================================================== */}
      {selectedCategory === "all" && !searchQuery && (
        <section className="py-12 bg-[#FAF6F0] border-b border-[#E2D9CC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-4 h-4 text-[#C99742] fill-[#C99742]" />
              <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0F3A23]">
                SOME FAVOURITES — OUR MOST-LOVED TREATS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {favouriteItems.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-white rounded-2xl p-4 border border-[#E2D9CC] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#3D271D] mb-3">
                    <img
                      src={fav.image}
                      alt={fav.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-106"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#0F3A23] line-clamp-1">
                      {fav.name}
                    </h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#FAF6F0]">
                      <span className="text-xs font-bold text-[#0F3A23]">
                        ₹{fav.price}
                      </span>
                      <button
                        onClick={() => addItem(fav)}
                        className="px-3 py-1 rounded-full bg-[#0F3A23] text-white text-[10px] font-semibold uppercase tracking-wider hover:bg-[#154D30] transition-colors cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          5. LIVE MENU SPLIT VIEW WITH STICKY "YOUR ORDER" DRAWER (Matching PDF Page 6)
          ================================================== */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left 8/12 Columns: 3-Column Product Grid */}
            <div className="lg:col-span-8 space-y-12">
              {activeCategories.map((cat) => {
                const itemsInCat = menuItems.filter(
                  (item) => item.category === cat.id && matchesSearch(item)
                );

                if (itemsInCat.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-6">
                    {/* Category Title & Description */}
                    <div className="border-b border-[#E2D9CC] pb-3 flex items-end justify-between">
                      <div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3A23]">
                          {cat.label}
                        </h2>
                        <p className="text-xs text-[#6E776F] font-light mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[#6E776F]">
                        {itemsInCat.length} items
                      </span>
                    </div>

                    {/* 3-Column Product Grid matching Page 6 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {itemsInCat.map((item) => {
                        const qty = getItemQuantity(item.id);
                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-2xl overflow-hidden border border-[#E2D9CC] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                          >
                            <div>
                              {/* Product Image */}
                              <div className="aspect-4/3 w-full overflow-hidden bg-[#3D271D] relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-106"
                                  loading="lazy"
                                />
                                {(item.isBestseller || item.isFeatured) && (
                                  <span className="absolute top-2.5 left-2.5 bg-[#0F3A23]/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                                    Popular
                                  </span>
                                )}
                              </div>

                              {/* Title & Description */}
                              <div className="p-4 space-y-1">
                                <h3 className="font-serif text-lg font-bold text-[#0F3A23] leading-tight">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-[#6E776F] font-light line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            {/* Card Bottom: Price, Quantity Stepper & Add to Cart Pill Button (Page 6) */}
                            <div className="p-4 pt-2 border-t border-[#FAF6F0] flex items-center justify-between gap-2">
                              <span className="font-serif text-lg font-bold text-[#0F3A23]">
                                ₹{item.price}
                              </span>

                              {qty > 0 ? (
                                <div className="inline-flex items-center gap-2 bg-[#FAF6F0] border border-[#E2D9CC] rounded-full px-2 py-1">
                                  <button
                                    onClick={() => updateQuantity(item.id, qty - 1)}
                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#E8DFD1] text-[#0F3A23]"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold text-[#0F3A23] min-w-4 text-center">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, qty + 1)}
                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#E8DFD1] text-[#0F3A23]"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addItem(item)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-2xs group cursor-pointer"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 4/12 Columns: Sticky "Your Order" Drawer (Matching PDF Page 6) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-36">
              <div className="bg-white rounded-2xl p-6 border border-[#E2D9CC] shadow-lg space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3.5">
                  <div className="flex items-center gap-2 text-[#0F3A23]">
                    <ShoppingBag className="w-5 h-5 text-[#0F3A23]" />
                    <h3 className="font-serif text-xl font-bold">Your Order</h3>
                  </div>
                  <span className="text-xs font-medium text-[#6E776F]">
                    {totalCount} {totalCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items List */}
                {orderItems.length === 0 ? (
                  <div className="text-center py-10 text-[#6E776F] space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto opacity-30 text-[#0F3A23]" />
                    <p className="text-xs">Your bag is currently empty.</p>
                    <p className="text-[11px] text-[#6E776F]/80">
                      Add delicious bakes and coffees from the menu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                    {orderItems.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E2D9CC]/60"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover bg-[#3D271D] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm font-bold text-[#0F3A23] truncate">
                            {item.name}
                          </h4>
                          <span className="text-xs font-bold text-[#0F3A23]">
                            ₹{item.price * quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, quantity - 1)}
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#0F3A23] text-xs hover:bg-[#E8DFD1]"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-[#0F3A23] min-w-3 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, quantity + 1)}
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#0F3A23] text-xs hover:bg-[#E8DFD1]"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#6E776F] hover:text-rose-600 p-1 ml-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtotal & Total */}
                {orderItems.length > 0 && (
                  <div className="border-t border-[#FAF6F0] pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-[#6E776F]">
                      <span>Subtotal</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-[#6E776F]">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-base font-serif font-bold text-[#0F3A23] pt-2 border-t border-[#FAF6F0]">
                      <span>Total</span>
                      <span>₹{grandTotal}</span>
                    </div>

                    <button
                      onClick={openDrawer}
                      className="w-full mt-3 py-3 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                )}

                {/* Trust Badges matching PDF Page 6 bottom */}
                <div className="border-t border-[#FAF6F0] pt-4 space-y-2.5 text-[11px] text-[#6E776F]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0F3A23]" />
                    <span>Freshly Baked — Made with love, everyday.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0F3A23]" />
                    <span>Quality Ingredients — Only the best, always.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0F3A23]" />
                    <span>A Sweeter Day — Good food, better days.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. CELEBRATION CAKES BANNER (Matching PDF Page 7)
          ================================================== */}
      <CakesCelebrationBanner />
    </div>
  );
};

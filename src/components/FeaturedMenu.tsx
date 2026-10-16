import { MENU_ITEMS, type MenuItem } from "../data/menuData";
import { VegBadge } from "./VegBadge";
import { useOrder } from "../context/OrderContext";
import { Plus, Check, ArrowRight } from "lucide-react";

export const FeaturedMenu: React.FC = () => {
  const { addItem, items } = useOrder();

  // Pick the 6 items explicitly highlighted in the prompt
  const featuredIds = [
    "dark-and-white-delight",
    "oreo-dark-crunch",
    "paneer-pizza",
    "cheese-sandwich",
    "chocolate-shake",
    "cheese-momos",
  ];

  const featuredItems: MenuItem[] = featuredIds
    .map((id) => MENU_ITEMS.find((item) => item.id === id))
    .filter(Boolean) as MenuItem[];

  const getItemCountInCart = (id: string) => {
    const found = items.find((i) => i.item.id === id);
    return found ? found.quantity : 0;
  };

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#755546] block mb-2">
            Local Classics
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C241E] tracking-tight">
            A few things we&apos;re known for.
          </h2>
          <div className="w-12 h-0.5 bg-[#C59F54] mx-auto mt-4 mb-4" />
          <p className="text-sm sm:text-base text-[#59605C] font-light leading-relaxed">
            Handcrafted with honest ingredients, served warm, and made fresh for sweet cravings and savory catch-ups.
          </p>
        </div>

        {/* 6 Large Food Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {featuredItems.map((item) => {
            const count = getItemCountInCart(item.id);

            return (
              <div
                key={item.id}
                className="group bg-[#FCFAF7] rounded-xl overflow-hidden border border-[#E8DFD3] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 flex flex-col"
              >
                {/* Large Food Photography */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-[#EFE9DE]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Veg Indicator Badge */}
                  <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-md shadow-xs">
                    <VegBadge size="md" />
                  </div>

                  {/* Bestseller Badge */}
                  {item.isBestseller && (
                    <div className="absolute top-3.5 right-3.5 bg-[#26332A] text-[#FAF7F2] text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                      Popular
                    </div>
                  )}

                  {/* Price Chip */}
                  <div className="absolute bottom-3.5 right-3.5 bg-[#FAF7F2]/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-[#1C241E] shadow-xs">
                    ₹{item.price}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C241E] leading-snug group-hover:text-[#26332A] transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#59605C] leading-relaxed line-clamp-2 font-light">
                      {item.description}
                    </p>
                  </div>

                  {/* Action row */}
                  <div className="pt-5 mt-4 border-t border-[#EFE9DE] flex items-center justify-between">
                    <span className="text-base font-semibold text-[#1C241E] font-serif">
                      ₹{item.price}
                    </span>

                    <button
                      onClick={() => addItem(item)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        count > 0
                          ? "bg-[#26332A] text-white hover:bg-[#1C241E]"
                          : "bg-[#EFE9DE] text-[#26332A] hover:bg-[#E3D9C9]"
                      }`}
                      aria-label={`Add ${item.name} to order`}
                    >
                      {count > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#C59F54]" />
                          <span>Added ({count})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Menu CTA */}
        <div className="text-center mt-14 sm:mt-18">
          <button
            onClick={scrollToMenu}
            className="inline-flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-[#1C241E] border-b-2 border-[#1C241E] pb-1 hover:text-[#755546] hover:border-[#755546] transition-colors group cursor-pointer"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

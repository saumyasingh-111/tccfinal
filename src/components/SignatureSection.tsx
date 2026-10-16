import React from "react";
import { VegBadge } from "./VegBadge";
import { useOrder } from "../context/OrderContext";
import { MENU_ITEMS } from "../data/menuData";
import { ArrowUpRight, Plus } from "lucide-react";

export const SignatureSection: React.FC = () => {
  const { addItem } = useOrder();

  const signatures = [
    {
      item: MENU_ITEMS.find((i) => i.id === "oreo-dark-crunch")!,
      subtitle: "The Student Craving",
      tagline: "Molten dark chocolate fudge meets crunchy crushed Oreos.",
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1200&q=80",
    },
    {
      item: MENU_ITEMS.find((i) => i.id === "paneer-pizza")!,
      subtitle: "Fresh From the Oven",
      tagline: "Crisp crust loaded with marinated cottage cheese, crunchy peppers & molten mozzarella.",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
    },
    {
      item: MENU_ITEMS.find((i) => i.id === "cold-coffee")!,
      subtitle: "Thick & Handcrafted",
      tagline: "Slow-churned creamy cold brew with rich chocolate swirl and velvety foam.",
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#212B23] text-[#FAF7F2] relative overflow-hidden">
      {/* Subtle organic texture glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C59F54]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3C2A22]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-px bg-[#D8B774]" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#D8B774]">
              House Signatures
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide text-white leading-[1.12]">
            THE ONES YOU&apos;LL COME BACK FOR
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#E5DBCA]/80 font-light max-w-xl leading-relaxed">
            Every cafe has a few dishes that quietly become rituals. Here are the three our regulars order without ever looking at the menu.
          </p>
        </div>

        {/* 3 Signature Editorial Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {signatures.map((sig, idx) => (
            <div
              key={sig.item.id}
              className="group flex flex-col bg-[#1A231C] rounded-2xl overflow-hidden border border-white/10 hover:border-[#D8B774]/40 transition-all duration-500"
            >
              {/* Image Frame */}
              <div className="relative aspect-5/4 w-full overflow-hidden bg-black/40">
                <img
                  src={sig.image}
                  alt={sig.item.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 brightness-95 group-hover:brightness-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Number Watermark */}
                <span className="absolute top-4 left-4 font-serif text-2xl font-light text-white/50 tracking-widest">
                  0{idx + 1}
                </span>

                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#FAF7F2] border border-white/10">
                  ₹{sig.item.price}
                </div>

                {/* Subtitle tag */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#D8B774]">
                    {sig.subtitle}
                  </span>
                  <VegBadge size="sm" />
                </div>
              </div>

              {/* Text & Order button */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-[#D8B774] transition-colors">
                    {sig.item.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#E5DBCA]/70 font-light leading-relaxed">
                    {sig.tagline}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm font-serif text-[#FAF7F2]/80">
                    Always 100% Vegetarian
                  </span>

                  <button
                    onClick={() => addItem(sig.item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F2] text-[#1C241E] hover:bg-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs group/btn"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Add</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

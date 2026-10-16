import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";
import { BotanicalSprig } from "../components/BotanicalSprig";
import { X, ChevronLeft, ChevronRight, Eye, ArrowRight } from "lucide-react";

export const GalleryPage: React.FC = () => {
  const { galleryItems } = useData();
  const [filter, setFilter] = useState<string>("All");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Visible items only
  const visibleItems = galleryItems.filter((i) => i.isVisible !== false);

  const categories = [
    "All",
    "Food",
    "Beverages",
    "Desserts",
    "Café Vibes",
  ];

  const filteredImages = visibleItems.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Food") return item.category.toLowerCase().includes("bites") || item.category.toLowerCase().includes("table");
    if (filter === "Beverages") return item.category.toLowerCase().includes("beverage") || item.category.toLowerCase().includes("coffee");
    if (filter === "Desserts") return item.category.toLowerCase().includes("dessert") || item.category.toLowerCase().includes("cake") || item.category.toLowerCase().includes("bake");
    if (filter === "Café Vibes") return item.category.toLowerCase().includes("interior") || item.category.toLowerCase().includes("vibe") || item.category.toLowerCase().includes("table");
    return item.category === filter;
  });

  const openLightbox = (index: number) => setLightboxIdx(index);
  const closeLightbox = () => setLightboxIdx(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIdx !== null) {
      setLightboxIdx((lightboxIdx + 1) % filteredImages.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIdx !== null) {
      setLightboxIdx((lightboxIdx - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <div className="bg-[#F5EFEB] text-[#162820]">
      {/* ==================================================
          1. GALLERY HERO (Matching PDF Page 4)
          ================================================== */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left: Headline & Tags */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.34em] uppercase text-[#6E776F] block">
                OUR GALLERY
              </span>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[72px] font-bold text-[#0F3A23] tracking-tight leading-[1.05]">
                Moments<br />
                <span className="italic font-bold">That Stay.</span>
              </h1>

              <div className="w-12 h-0.5 bg-[#C99742]" />

              {/* Tags (matching PDF Page 4) */}
              <p className="text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase text-[#6E776F]">
                GOOD FOOD • GREAT COFFEE • HAPPIER DAYS
              </p>

              <p className="text-sm sm:text-base text-[#162820]/80 font-light leading-relaxed max-w-lg">
                A visual diary of morning ovens, comforting conversations, handcrafted brews, and warm bakery counters.
              </p>
            </div>

            {/* Right: Arched Cafe Interior Photo Cutout (matching PDF Page 4) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#082118] w-full max-w-sm aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
                  alt="Cozy ambient cafe table and warm lights"
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-104"
                />
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-white">
                  <span className="font-serif italic text-xs text-[#D4A359]">
                    Good Food Better Days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. CATEGORY FILTER BAR (Matching PDF Page 4)
          ================================================== */}
      <section className="sticky top-18 sm:top-20 z-30 bg-[#F5EFEB]/95 backdrop-blur-md border-y border-[#E2D9CC] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto no-scrollbar flex items-center justify-start sm:justify-center gap-2 py-0.5">
            {categories.map((cat) => {
              const isActive = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setFilter(cat);
                    setLightboxIdx(null);
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#0F3A23] text-[#FAF6F0] shadow-sm"
                      : "bg-[#FAF6F0] text-[#162820] hover:text-[#0F3A23] hover:bg-[#E8DFD1] border border-[#E2D9CC]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          3. MASONRY PHOTO GRID (Matching PDF Page 4)
          ================================================== */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredImages.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-[#3D271D] border border-[#E2D9CC] shadow-2xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  loading="lazy"
                />

                {/* Subtle Editorial Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-[#D4A359] font-semibold block mb-1">
                    {item.category}
                  </span>
                  <p className="font-serif text-lg text-white font-medium line-clamp-2 leading-snug">
                    {item.caption}
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-white/90">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View fullscreen</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          4. INSTAGRAM ANNOUNCEMENT STRIP (Matching PDF Page 5 top)
          ================================================== */}
      <section className="bg-[#FAF6F0] border-t border-[#E2D9CC] py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <BotanicalSprig side="left" />
            <h3 className="font-serif italic text-2xl font-bold text-[#0F3A23]">
              More Stories Coming Soon...
            </h3>
            <BotanicalSprig side="right" />
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#6E776F]">
            STAY TUNED FOR MORE MOMENTS, MORE GOOD FOOD AND HAPPIER DAYS.
          </p>
          <div className="pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#154D30] transition-colors shadow-sm"
            >
              <span>Follow Us on Instagram</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. CELEBRATION CAKES BANNER (Matching PDF Page 7)
          ================================================== */}
      <CakesCelebrationBanner />

      {/* ==================================================
          6. LIGHTBOX MODAL
          ================================================== */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-hero-fade"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 transition-colors z-10"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 transition-colors z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 transition-colors z-10"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredImages[lightboxIdx]?.url}
              alt={filteredImages[lightboxIdx]?.caption}
              className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4A359] font-semibold">
                {filteredImages[lightboxIdx]?.category}
              </span>
              <p className="font-serif text-lg sm:text-xl text-white/95">
                {filteredImages[lightboxIdx]?.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

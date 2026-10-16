import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface GalleryImage {
  src: string;
  title: string;
  category: string;
  span: string; // Tailwind grid span
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    title: "Signature Dark & White Chocolate Drizzle",
    category: "Signature Desserts",
    span: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80",
    title: "Warm wooden cafe corner & study tables",
    category: "Cafe Interior",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1000&q=80",
    title: "Handcrafted Frothy Cold Coffee",
    category: "Chilled Brews",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80",
    title: "Stone-baked Spiced Paneer Pizza",
    category: "Hot Savouries",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
    title: "Fresh Morning Bakes & Bakery Counter",
    category: "Daily Counter",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1000&q=80",
    title: "Golden Toasted Cheese Melt Sandwiches",
    category: "Grilled Sandwiches",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    title: "Warm Hot Chocolate Brownie Cup",
    category: "Sweet Bites",
    span: "col-span-1 md:col-span-1 row-span-1",
  },
];

export const Gallery: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIdx(index);
  const closeLightbox = () => setSelectedIdx(null);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % GALLERY_IMAGES.length);
    }
  };

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-[#F7F3EC] scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#755546] block mb-2">
            Moments &amp; Moods
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C241E] tracking-tight">
            Life at The Classic Crush
          </h2>
          <div className="w-12 h-0.5 bg-[#C59F54] mx-auto mt-4 mb-4" />
          <p className="text-sm sm:text-base text-[#59605C] font-light">
            A peek into our everyday bakes, cozy hangout corners, and sweet treats.
          </p>
        </div>

        {/* Asymmetric Masonry-style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[220px]">
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={img.src}
              onClick={() => openLightbox(idx)}
              className={`group relative rounded-xl overflow-hidden cursor-pointer bg-[#EFE9DE] border border-[#E8DFD3] ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                loading="lazy"
              />

              {/* Subtle Dark Vignette on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#D8B774] mb-1">
                  {img.category}
                </span>
                <p className="font-serif text-base sm:text-lg font-medium leading-snug">
                  {img.title}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#FAF7F2]/80">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Click to expand</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-all"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/70 transition-all cursor-pointer z-60"
            aria-label="Close photo preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-8 text-white/80 hover:text-white p-3 rounded-full bg-black/40 hover:bg-black/70 transition-all cursor-pointer z-60"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-8 text-white/80 hover:text-white p-3 rounded-full bg-black/40 hover:bg-black/70 transition-all cursor-pointer z-60"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Image Box */}
          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={GALLERY_IMAGES[selectedIdx].src}
              alt={GALLERY_IMAGES[selectedIdx].title}
              className="max-h-[75vh] w-auto max-w-full rounded-lg shadow-2xl object-contain"
            />
            <div className="mt-4 text-center text-white">
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#D8B774] block">
                {GALLERY_IMAGES[selectedIdx].category}
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold mt-0.5">
                {GALLERY_IMAGES[selectedIdx].title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-[#F5EFEB] py-14 sm:py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
            {/* Eyebrow */}
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.34em] uppercase text-[#6E776F] block">
              BAKERY • CAFÉ • GOOD FOOD • BETTER DAYS
            </span>

            {/* Oversized Serif Headline Matching PDF Page 1 */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold text-[#0F3A23] leading-[1.05] tracking-tight">
              More Than<br />
              <span className="italic font-bold">Just a Bakery.</span>
            </h1>

            {/* Descriptive Editorial Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-[#162820]/80 font-light max-w-lg leading-relaxed">
              Freshly baked, thoughtfully brewed, and made to be shared. At The Classic Crush, we turn everyday moments into something special.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#0F3A23] hover:bg-[#154D30] text-[#FAF6F0] text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
              >
                <span>Explore Our Menu</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Three Circular Swatches + Category Line */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center -space-x-1">
                <span className="w-3.5 h-3.5 rounded-full bg-[#54392B] border-2 border-[#F5EFEB]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#8C6239] border-2 border-[#F5EFEB]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#C99742] border-2 border-[#F5EFEB]" />
              </div>
              <span className="font-serif text-xs sm:text-sm text-[#162820]/75 tracking-wide">
                Cakes • Coffee • Bakes • More
              </span>
            </div>
          </div>

          {/* Right Column: Cafe Storefront Exterior Photo Frame with Warm Glow */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#E2D9CC] bg-[#E8DFD1]">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=85"
                alt="The Classic Crush charming cafe storefront with green awning, warm lights, and sidewalk dining table"
                className="w-full h-[380px] sm:h-[480px] lg:h-[540px] object-cover object-center transition-transform duration-1000 hover:scale-102"
                loading="eager"
              />

              {/* Decorative Awning Label Overlay (top right) */}
              <div className="absolute top-4 right-4 bg-[#0F3A23]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-[#FAF6F0] text-[10px] font-semibold tracking-[0.2em] uppercase">
                THE CLASSIC CRUSH
              </div>

              {/* Neon Style Badge Overlay (bottom left) */}
              <div className="absolute bottom-4 left-4 bg-black/55 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-white">
                <p className="font-serif italic text-xs sm:text-sm text-[#D4A359]">
                  &ldquo;Good Food Better Days ♡&rdquo;
                </p>
                <span className="text-[9px] uppercase tracking-wider text-white/70">
                  Est. 2024 • 100% Pure Vegetarian
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CakesCelebrationBanner: React.FC = () => {
  return (
    <section className="bg-[#0F3A23] text-[#FAF6F0] py-14 sm:py-18 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left: Cake & Coffee Photo with Curved Arch Treatment */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="relative rounded-2xl md:rounded-l-3xl md:rounded-r-xl overflow-hidden shadow-2xl border border-white/15 aspect-4/3 sm:aspect-16/10 bg-[#082118]">
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80"
                alt="Handcrafted celebration chocolate cake with fresh strawberries"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 bg-[#0F3A23]/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] uppercase tracking-wider text-[#D4A359] font-medium">
                100% Eggless
              </div>
            </div>
          </div>

          {/* Right: Copy & CTA */}
          <div className="md:col-span-7 lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#D4A359] block">
              CRAVING MORE?
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Cakes for Every Celebration.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#FAF6F0]/80 font-light max-w-lg leading-relaxed">
              From milestone birthdays and intimate anniversaries to midnight sweet cravings, our custom eggless celebration cakes are baked fresh with Belgian cocoa, real fruit compotes, and love.
            </p>
            <div className="pt-2">
              <Link
                to="/menu?category=signature-desserts"
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#F5EFEB] text-[#0F3A23] hover:bg-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
              >
                <span>Explore Cakes</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

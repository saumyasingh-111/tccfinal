import React from "react";
import { VegBadge } from "./VegBadge";
import { Heart, Sparkles, Coffee } from "lucide-react";

export const OurStory: React.FC = () => {
  return (
    <section id="story" className="py-20 sm:py-28 bg-[#FAF7F2] border-t border-[#E8DFD3] scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Authentic Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-black/5 border border-[#E8DFD3] bg-[#EFE9DE]">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
                alt="Inside The Classic Crush cafe with warm ambient lighting"
                className="w-full h-[380px] sm:h-[480px] object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Floating Pure Veg Stamp */}
              <div className="absolute bottom-6 left-6 bg-[#FCFAF7]/95 backdrop-blur-md p-4 rounded-xl border border-[#E8DFD3] shadow-md max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <VegBadge size="md" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1C241E]">
                    100% Pure Vegetarian
                  </span>
                </div>
                <p className="text-[11px] text-[#59605C] font-light leading-snug">
                  From our fluffy bakery pastries to savory grilled snacks, every single bite is strictly eggless and vegetarian.
                </p>
              </div>
            </div>

            {/* Decorative background accent block */}
            <div className="hidden sm:block absolute -top-4 -left-4 w-28 h-28 bg-[#E5DBCA]/50 rounded-2xl -z-10" />
            <div className="hidden sm:block absolute -bottom-4 -right-4 w-32 h-32 bg-[#26332A]/5 rounded-2xl -z-10" />
          </div>

          {/* Right Column: Genuine Warm Story */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#755546] block mb-2">
                Our Story
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C241E] leading-tight">
                Made for good food &amp; good company.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#3E4340] leading-relaxed font-light">
              The Classic Crush started with a very simple thought: you shouldn&apos;t have to spend a fortune or sit in a stiff, pretentious room just to enjoy great food with the people you love.
            </p>

            <p className="text-sm sm:text-base text-[#575E5B] leading-relaxed font-light">
              We&apos;re a local neighbourhood bakery &amp; cafe where students study between lectures, friends catch up over piping hot cheese sandwiches, and chocolate cravings find their true home in warm brownie tubs and loaded waffle bites.
            </p>

            <p className="text-sm sm:text-base text-[#575E5B] leading-relaxed font-light">
              Everything on our counter is 100% vegetarian, freshly made, and priced so you can visit as often as you like without thinking twice. No gimmicks — just honest, comforting food that feels like a warm hug.
            </p>

            {/* Values Pill Strip */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E8DFD3]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EFE9DE] flex items-center justify-center shrink-0 text-[#26332A]">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1C241E]">Honest &amp; Local</h4>
                  <p className="text-[11px] text-[#767E7A] font-light">Student-friendly pricing every day</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EFE9DE] flex items-center justify-center shrink-0 text-[#26332A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1C241E]">100% Veg</h4>
                  <p className="text-[11px] text-[#767E7A] font-light">Eggless pastries &amp; clean bakes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EFE9DE] flex items-center justify-center shrink-0 text-[#26332A]">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1C241E]">Warm Vibe</h4>
                  <p className="text-[11px] text-[#767E7A] font-light">Cozy tables &amp; cheerful service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

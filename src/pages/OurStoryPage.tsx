import React from "react";
import { Link } from "react-router-dom";
import { VegBadge } from "../components/VegBadge";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";
import {
  Croissant,
  Coffee,
  Heart,
  ArrowRight,
  Store,
  Lightbulb,
  ChefHat,
  Smile,
} from "lucide-react";

export const OurStoryPage: React.FC = () => {
  return (
    <div className="bg-[#F5EFEB] text-[#162820]">
      {/* ==================================================
          1. ABOUT US HERO (Matching PDF Page 2)
          ================================================== */}
      <section className="py-14 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Headline & Introduction */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#6E776F] block">
                ABOUT US
              </span>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0F3A23] tracking-tight leading-[1.08]">
                A Little<br />
                Place With a<br />
                <span className="italic font-bold">Big Heart.</span>
              </h1>

              <div className="w-12 h-0.5 bg-[#C99742]" />

              <p className="text-sm sm:text-base md:text-lg text-[#162820]/80 font-light leading-relaxed max-w-lg">
                The Classic Crush is a bakery &amp; café built on a simple idea — that good food can bring people closer. It&apos;s a cosy corner for fresh bakes, great coffee and everyday moments that feel a little more special.
              </p>

              <div className="pt-2">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#0F3A23] text-[#FAF6F0] hover:bg-[#154D30] text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right: Arched Cafe Doorway Photo Frame (matching PDF Page 2) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#082118] w-full max-w-md aspect-4/5 sm:aspect-3/4">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
                  alt="The Classic Crush charming cafe entrance with green exterior and warm lights"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-104"
                  loading="eager"
                />

                {/* Aesthetic Floating Badge Overlays */}
                <div className="absolute top-8 right-6 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-[#D4A359] text-[10px] font-semibold tracking-widest uppercase">
                  EST. 2024
                </div>

                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white">
                  <p className="font-serif italic text-xs sm:text-sm text-[#FAF6F0]">
                    GOOD FOOD BETTER DAYS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. OUR BELIEF: GOOD FOOD BRINGS PEOPLE CLOSER (Matching PDF Page 2 Deep Green Section)
          ================================================== */}
      <section className="py-20 sm:py-28 bg-[#0F3A23] text-[#FAF6F0] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Copy */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#D4A359] block">
                OUR BELIEF
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                Good Food<br />Brings People Closer.
              </h2>

              <p className="text-sm sm:text-base text-[#FAF6F0]/80 font-light leading-relaxed max-w-md">
                We believe honest ingredients, comforting flavours and a welcoming space can turn ordinary days into something special.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs text-[#D4A359]">
                <VegBadge size="sm" />
                <span>100% Pure Vegetarian &amp; Eggless Bakes</span>
              </div>
            </div>

            {/* Right: 3 Portrait Food & Cafe Photos (matching PDF Page 2) */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-3.5 sm:gap-5">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-3/4 bg-[#3D271D] border border-white/15 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh artisan bakes from the morning oven"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-106"
                  loading="lazy"
                />
              </div>

              <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-3/4 bg-[#3D271D] border border-white/15 shadow-lg -translate-y-2 sm:-translate-y-4">
                <img
                  src="/dark-white-delight.jpg"
                  alt="Signature chocolate cake and delights"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-106"
                  loading="lazy"
                />
              </div>

              <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-3/4 bg-[#3D271D] border border-white/15 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80"
                  alt="Handcrafted thick cold coffee and fresh beverages"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-106"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. OUR STORY: FROM A SIMPLE IDEA TO A COSY CAFÉ (Matching PDF Page 2)
          ================================================== */}
      <section className="py-20 sm:py-28 bg-[#F5EFEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Coffee & Croissants Photography */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#E2D9CC] bg-[#E8DFD1]">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80"
                  alt="Fresh buttery croissants and signature TCC coffee"
                  className="w-full h-[360px] sm:h-[460px] object-cover transition-transform duration-700 hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E2D9CC] text-xs font-semibold text-[#0F3A23]">
                  Baked Fresh Every Morning
                </div>
              </div>
            </div>

            {/* Right: Story Details & 3 Values (matching PDF Page 2) */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#6E776F] block">
                OUR STORY
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#0F3A23] tracking-tight leading-tight">
                From a Simple Idea<br />to a Cosy Café.
              </h2>

              <p className="text-sm sm:text-base text-[#162820]/80 font-light leading-relaxed">
                The Classic Crush began with a simple love for baking, coffee and the little joys in between. What started as a personal passion has now grown into a space where people can slow down, enjoy good food and create warm memories.
              </p>

              {/* 3 Value Pillars (matching PDF Page 2) */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E2D9CC]">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center text-[#0F3A23] mb-2">
                    <Croissant className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="font-serif text-sm font-bold text-[#0F3A23]">
                    Freshly Baked
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center text-[#0F3A23] mb-2">
                    <Coffee className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="font-serif text-sm font-bold text-[#0F3A23]">
                    Great Coffee
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center text-[#0F3A23] mb-2">
                    <Heart className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="font-serif text-sm font-bold text-[#0F3A23]">
                    A Cosy Space
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. OUR JOURNEY (Matching PDF Page 2 Bottom 4-Stage Horizontal Flow)
          ================================================== */}
      <section className="py-20 sm:py-28 bg-[#0F3A23] text-[#FAF6F0] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#D4A359] block mb-3">
            OUR JOURNEY
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight mb-14">
            How We Grew
          </h2>

          {/* 4 Process Cards with Illustrated Icons & Connecting Arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#144434] rounded-2xl p-6 sm:p-7 border border-white/10 text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#0F3A23] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359] mb-5">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                  The Beginning
                </h3>
                <p className="text-xs sm:text-sm text-[#FAF6F0]/75 font-light leading-relaxed">
                  A simple idea, a love for baking and coffee.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#D4A359] tracking-widest uppercase mt-6 block">
                PHASE 01
              </span>
            </div>

            {/* Step 2 */}
            <div className="bg-[#144434] rounded-2xl p-6 sm:p-7 border border-white/10 text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#0F3A23] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359] mb-5">
                  <ChefHat className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                  Small Steps
                </h3>
                <p className="text-xs sm:text-sm text-[#FAF6F0]/75 font-light leading-relaxed">
                  From kitchen experiments to happy customers.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#D4A359] tracking-widest uppercase mt-6 block">
                PHASE 02
              </span>
            </div>

            {/* Step 3 */}
            <div className="bg-[#144434] rounded-2xl p-6 sm:p-7 border border-white/10 text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#0F3A23] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359] mb-5">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                  A Cosy Space
                </h3>
                <p className="text-xs sm:text-sm text-[#FAF6F0]/75 font-light leading-relaxed">
                  Turning a dream into a café with a warm soul.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#D4A359] tracking-widest uppercase mt-6 block">
                PHASE 03
              </span>
            </div>

            {/* Step 4 */}
            <div className="bg-[#144434] rounded-2xl p-6 sm:p-7 border border-white/10 text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#0F3A23] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359] mb-5">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                  Today
                </h3>
                <p className="text-xs sm:text-sm text-[#FAF6F0]/75 font-light leading-relaxed">
                  More good food, more better days with our community.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#D4A359] tracking-widest uppercase mt-6 block">
                TODAY &amp; BEYOND
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. BOTTOM CELEBRATION CAKES BANNER (Matching PDF Page 7)
          ================================================== */}
      <CakesCelebrationBanner />
    </div>
  );
};

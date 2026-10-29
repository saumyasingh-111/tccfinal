import React from "react";
import { Link } from "react-router-dom";
import { Hero } from "../components/Hero";
import { ValuePropsBar } from "../components/ValuePropsBar";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";
import { useData } from "../context/DataContext";
import { useOrder } from "../context/OrderContext";
import {
  ArrowRight,
  Gift,
  Clock,
  MapPin,
  Phone,
  Navigation,
  MessageCircle,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { cafeInfo, giftProducts } = useData();
  const { openDrawer } = useOrder();

  // Curated gift items for Gifting Teaser
  const teaserGifts = giftProducts.filter((p) => p.isFeatured).slice(0, 3);

  // 4 Featured Categories matching Page 1 "A Little Bit of Everything"
  const previewCategories = [
    {
      id: "signature-desserts",
      title: "Pastry",
      subtitle: "Classic flavours, made with love.",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "beverages",
      title: "Coffee",
      subtitle: "Brewed to brighten your day.",
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "quick-bites",
      title: "Quick Bites",
      subtitle: "Fresh from the oven.",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "signature-desserts",
      title: "Signature",
      subtitle: "Perfect for in-between moments.",
      image: "/dark-white-delight.jpg",
    },
  ];

  return (
    <div className="bg-[#F5EFEB] text-[#162820]">
      {/* ==================================================
          1. HERO SECTION (Matching PDF Page 1)
          ================================================== */}
      <Hero />

      {/* ==================================================
          2. 5-ITEM VALUE PROPS BAR (Matching PDF Page 1)
          ================================================== */}
      <ValuePropsBar />

      {/* ==================================================
          3. OUR MENU: A LITTLE BIT OF EVERYTHING (Matching PDF Page 1)
          ================================================== */}
      <section className="py-20 sm:py-28 bg-[#F5EFEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#6E776F] block mb-2">
                OUR MENU
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#0F3A23] tracking-tight">
                A Little Bit of Everything
              </h2>
              <p className="text-xs sm:text-sm text-[#162820]/75 font-light mt-2 max-w-lg">
                From soft, buttery bakes to rich coffees — discover your next favourite.
              </p>
            </div>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#0F3A23] text-[#0F3A23] hover:bg-[#0F3A23] hover:text-[#FAF6F0] text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 self-start sm:self-auto shrink-0 group"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 4 Cards Grid Matching PDF Page 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {previewCategories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/menu?category=${cat.id}`}
                className="group flex flex-col justify-between bg-white rounded-2xl overflow-hidden border border-[#E2D9CC] shadow-2xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Image Container with Warm Food Tone */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-[#3D271D]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>

                {/* Card Content & Circular Arrow Button */}
                <div className="p-5 flex items-end justify-between gap-3 bg-white">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F3A23] group-hover:text-[#154D30] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#6E776F] font-light mt-1">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Circular Arrow Button (matching PDF) */}
                  <div className="w-8 h-8 rounded-full border border-[#0F3A23]/30 flex items-center justify-center shrink-0 text-[#0F3A23] group-hover:bg-[#0F3A23] group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          4. ABOUT US: THE CLASSIC CRUSH (Matching PDF Page 1 Deep Forest Green Section)
          ================================================== */}
      <section className="py-20 sm:py-28 bg-[#0F3A23] text-[#FAF6F0] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Story Copy & CTA */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#D4A359] block">
                ABOUT US
              </span>

              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                The Classic Crush
              </h2>

              <p className="text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase text-[#FAF6F0]/85">
                A BAKERY &amp; CAFÉ WITH A STORY
              </p>

              <p className="text-sm sm:text-base text-[#FAF6F0]/80 font-light leading-relaxed max-w-lg">
                The Classic Crush is a celebration of good food, warm conversations, and the little joys in between. We believe in honest ingredients, comforting flavours, and a space where everyone feels at home.
              </p>

              <div className="pt-2">
                <Link
                  to="/our-story"
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#FAF6F0] text-[#0F3A23] hover:bg-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <span>Our Story</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Column: Arched Window / Cutout Photo with Warm Cafe Ambience */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl border-4 border-[#FAF6F0]/20 bg-[#082118] w-full max-w-md aspect-4/5 sm:aspect-3/4">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
                  alt="Warm sunlit corner at The Classic Crush with framed pictures and ambient lighting"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-104"
                  loading="lazy"
                />

                {/* Floating Neon Badge (matching PDF) */}
                <div className="absolute top-8 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[#FAF6F0]">
                  <p className="font-serif italic text-sm text-[#D4A359] leading-tight">
                    Good Food<br />Better Days ♡
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. A LITTLE LOVE, BEAUTIFULLY WRAPPED (Gifting Teaser)
          ================================================== */}
      <section className="py-20 sm:py-28 bg-[#FAF6F0] border-b border-[#E2D9CC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#0F3A23] block mb-2 flex items-center gap-2">
              <Gift className="w-3.5 h-3.5 text-[#0F3A23]" />
              <span>GIFTING BY THE CLASSIC CRUSH</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#0F3A23] tracking-tight leading-tight">
              Make someone&apos;s day a little sweeter.
            </h2>
            <p className="text-sm sm:text-base text-[#162820]/75 font-light mt-3 leading-relaxed">
              Thoughtfully arranged bouquets, artisanal chocolates, warm bakery gift boxes, and handwritten message cards for birthdays, celebrations, or just because.
            </p>
          </div>

          {/* 3 Curated Gifting Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {teaserGifts.map((gift) => (
              <div
                key={gift.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E2D9CC] shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-[#E8DFD1]">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    {gift.occasions[0] && (
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase text-[#0F3A23] shadow-xs">
                        {gift.occasions[0]}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-[#0F3A23] text-white backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                      {gift.priceDisplay || `₹${gift.price}`}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2">
                    <h3 className="font-serif text-xl font-bold text-[#0F3A23] group-hover:text-[#154D30] transition-colors">
                      {gift.name}
                    </h3>
                    <p className="text-xs text-[#6E776F] font-light line-clamp-2 leading-relaxed">
                      {gift.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 border-t border-[#FAF6F0] mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#0F3A23] font-medium">
                    Same-day cafe pickup available
                  </span>
                  <Link
                    to={`/gifting/${gift.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#0F3A23] group-hover:text-[#154D30]"
                  >
                    <span>View Gift</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/gifting"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#0F3A23] hover:bg-[#154D30] text-[#FAF6F0] text-xs font-semibold uppercase tracking-[0.16em] rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
            >
              <span>Explore All Gifts</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. VISIT US: COME FOR THE FOOD, STAY FOR THE VIBE (Matching PDF Page 1 bottom / Page 2 top)
          ================================================== */}
      <section className="py-20 sm:py-28 bg-[#F5EFEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Info Cards & CTAs */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div>
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#6E776F] block mb-2">
                  VISIT US
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#0F3A23] tracking-tight">
                  Come for the Food,<br />Stay for the Vibe.
                </h2>
                <p className="text-xs sm:text-sm text-[#162820]/75 font-light mt-2 max-w-md">
                  Great bakes, better coffee, and a cozy space waiting for you.
                </p>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#E2D9CC] shadow-2xs space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center shrink-0 text-[#0F3A23]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#0F3A23]">
                      Our Location
                    </h3>
                    <p className="text-xs text-[#162820]/80 mt-0.5 leading-relaxed">
                      {cafeInfo.address.street}
                    </p>
                    <p className="text-xs font-semibold text-[#0F3A23]">
                      {cafeInfo.address.city}
                    </p>
                    {cafeInfo.address.landmark && (
                      <p className="text-[11px] text-[#6E776F] italic mt-0.5">
                        Landmark: {cafeInfo.address.landmark}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-3 border-t border-[#FAF6F0]">
                  <div className="w-9 h-9 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center shrink-0 text-[#0F3A23]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#0F3A23]">
                      Opening Hours
                    </h3>
                    <p className="text-xs text-[#162820]/80 mt-0.5">
                      {cafeInfo.timings.days}
                    </p>
                    <p className="text-xs font-semibold text-[#0F3A23]">
                      {cafeInfo.timings.hours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-3 border-t border-[#FAF6F0]">
                  <div className="w-9 h-9 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center shrink-0 text-[#0F3A23]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#0F3A23]">
                      Get in Touch
                    </h3>
                    <a
                      href={`tel:${cafeInfo.phone}`}
                      className="text-xs font-medium text-[#0F3A23] hover:underline block mt-0.5"
                    >
                      {cafeInfo.phoneDisplay || cafeInfo.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={cafeInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3 bg-[#0F3A23] hover:bg-[#154D30] text-[#FAF6F0] text-xs font-semibold uppercase tracking-[0.16em] rounded-full transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Get Directions</span>
                </a>

                <button
                  onClick={openDrawer}
                  className="w-full sm:w-auto px-7 py-3 bg-white hover:bg-[#FAF6F0] text-[#0F3A23] border border-[#0F3A23] text-xs font-semibold uppercase tracking-[0.16em] rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#0F3A23]" />
                  <span>Order Online</span>
                </button>
              </div>
            </div>

            {/* Right: Map Embed Frame with Warm Editorial Styling */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#E2D9CC] bg-white h-[360px] sm:h-[420px] relative">
                <iframe
                  title="The Classic Crush Cafe Location Map"
                  src={cafeInfo.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale-[0.15] contrast-[1.05]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. CAKES FOR EVERY CELEBRATION (Matching PDF Page 7)
          ================================================== */}
      <CakesCelebrationBanner />
    </div>
  );
};

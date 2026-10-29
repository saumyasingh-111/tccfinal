import React from "react";
import { useData } from "../context/DataContext";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";
import { MapPin, Clock, Phone, Navigation, MessageCircle, ExternalLink } from "lucide-react";

export const VisitUsPage: React.FC = () => {
  const { cafeInfo } = useData();

  const callLink = `tel:${cafeInfo.phone}`;
  const whatsappLink = `https://wa.me/${cafeInfo.whatsappNumber}?text=${encodeURIComponent(
    `Hi ${cafeInfo.name}! 👋 I am visiting your cafe website and would like to ask a question.`
  )}`;

  return (
    <div className="bg-[#F5EFEB] text-[#162820]">
      {/* ==================================================
          1. VISIT US HERO (Matching PDF Pages 1 & 2)
          ================================================== */}
      <section className="py-14 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14 sm:mb-18">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.34em] uppercase text-[#6E776F] block">
              VISIT US
            </span>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0F3A23] tracking-tight leading-[1.05]">
              Come for the Food,<br />
              <span className="italic font-bold">Stay for the Vibe.</span>
            </h1>

            <div className="w-12 h-0.5 bg-[#C99742] mx-auto" />

            <p className="font-serif italic text-lg sm:text-2xl text-[#162820]/80 max-w-lg mx-auto">
              &ldquo;Great bakes, better coffee, and a cozy space waiting for you.&rdquo;
            </p>
          </div>

          {/* Details & Map Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Cafe Details & Quick Contact */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 text-left">
              {/* Address Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2D9CC] shadow-2xs space-y-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center shrink-0 text-[#0F3A23]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl font-bold text-[#0F3A23]">
                      Our Location
                    </h2>
                    <p className="text-sm text-[#162820]/80 leading-relaxed font-light">
                      {cafeInfo.address.street}
                    </p>
                    <p className="text-sm text-[#162820]/80 font-light">
                      {cafeInfo.address.area}
                    </p>
                    <p className="text-sm font-semibold text-[#0F3A23]">
                      {cafeInfo.address.city}
                    </p>
                    {cafeInfo.address.landmark && (
                      <p className="text-xs text-[#6E776F] italic pt-1">
                        Landmark: {cafeInfo.address.landmark}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Opening Hours Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2D9CC] shadow-2xs space-y-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center shrink-0 text-[#0F3A23]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl font-bold text-[#0F3A23]">
                      Opening Hours
                    </h2>
                    <p className="text-sm font-semibold text-[#0F3A23]">
                      {cafeInfo.timings.days}
                    </p>
                    <p className="text-sm text-[#162820]/80 font-light">
                      {cafeInfo.timings.hours}
                    </p>
                    {cafeInfo.timings.kitchenCloses && (
                      <p className="text-xs text-[#6E776F] pt-1">
                        Kitchen orders open until {cafeInfo.timings.kitchenCloses}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2D9CC] shadow-2xs space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8DFD1]/60 flex items-center justify-center shrink-0 text-[#0F3A23]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl font-bold text-[#0F3A23]">
                      Get in Touch
                    </h2>
                    <p className="text-xs text-[#6E776F]">
                      Questions about our eggless celebration cakes or group reservations?
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <a
                        href={callLink}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF6F0] border border-[#E2D9CC] text-xs font-semibold text-[#0F3A23] hover:bg-[#E8DFD1]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{cafeInfo.phoneDisplay || cafeInfo.phone}</span>
                      </a>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F3A23] text-white text-xs font-semibold hover:bg-[#154D30]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Us</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <a
                  href={cafeInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-8 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group"
                >
                  <Navigation className="w-4 h-4 text-[#D4A359]" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>

            {/* Right Column: Google Maps Embed Frame */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#E2D9CC] bg-white h-[420px] sm:h-[540px] relative w-full">
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
          2. CELEBRATION CAKES BANNER (Matching PDF Page 7)
          ================================================== */}
      <CakesCelebrationBanner />
    </div>
  );
};

import React from "react";
import { CAFE_CONFIG, getCallLink } from "../data/cafeConfig";
import { MapPin, Clock, Phone, ExternalLink, Navigation } from "lucide-react";

export const VisitUs: React.FC = () => {
  return (
    <section id="visit" className="py-20 sm:py-28 bg-[#FAF7F2] border-t border-[#E8DFD3] scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#755546] block mb-2">
            Location &amp; Hours
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#1C241E] tracking-tight">
            COME FIND US.
          </h2>
          <div className="w-12 h-0.5 bg-[#C59F54] mx-auto mt-4 mb-4" />
          <p className="text-sm sm:text-base text-[#59605C] font-light">
            We are conveniently located right in the heart of the student zone. Pop in for a quick bite or stay awhile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Info Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Address Box */}
            <div className="bg-[#FCFAF7] rounded-xl p-6 sm:p-7 border border-[#E8DFD3] shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center shrink-0 text-[#26332A]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1C241E]">
                    Our Address
                  </h3>
                  <p className="text-sm text-[#3E4340] leading-relaxed font-light">
                    {CAFE_CONFIG.address.street}
                  </p>
                  <p className="text-sm text-[#3E4340] font-light">
                    {CAFE_CONFIG.address.area}
                  </p>
                  <p className="text-sm font-medium text-[#755546]">
                    {CAFE_CONFIG.address.city}
                  </p>
                  {CAFE_CONFIG.address.landmark && (
                    <p className="text-xs text-[#767E7A] italic pt-1">
                      Landmark: {CAFE_CONFIG.address.landmark}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Opening Hours Box */}
            <div className="bg-[#FCFAF7] rounded-xl p-6 sm:p-7 border border-[#E8DFD3] shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center shrink-0 text-[#26332A]">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1C241E]">
                    Opening Hours
                  </h3>
                  <p className="text-sm font-medium text-[#26332A]">
                    {CAFE_CONFIG.timings.days}
                  </p>
                  <p className="text-sm text-[#3E4340] font-light">
                    {CAFE_CONFIG.timings.hours}
                  </p>
                  {CAFE_CONFIG.timings.kitchenCloses && (
                    <p className="text-xs text-[#755546] italic pt-1">
                      {CAFE_CONFIG.timings.kitchenCloses}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone & Direct Contact */}
            <div className="bg-[#FCFAF7] rounded-xl p-6 sm:p-7 border border-[#E8DFD3] shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center shrink-0 text-[#26332A]">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1C241E]">
                    Phone &amp; Enquiries
                  </h3>
                  <p className="text-sm text-[#3E4340] font-light">
                    Give us a ring for party reservations or takeout updates:
                  </p>
                  <a
                    href={getCallLink()}
                    className="inline-block text-base font-bold text-[#26332A] hover:underline pt-1"
                  >
                    {CAFE_CONFIG.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>

            {/* Get Directions CTA Button */}
            <a
              href={CAFE_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#26332A] hover:bg-[#1C241E] text-[#FAF7F2] text-xs font-semibold uppercase tracking-[0.2em] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm group"
            >
              <Navigation className="w-4 h-4 text-[#D8B774]" />
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Right Column: Clean Interactive Map Container */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#E8DFD3] shadow-sm relative min-h-[350px] lg:min-h-full bg-[#EFE9DE]">
            <iframe
              title="The Classic Crush Cafe Location Map"
              src={CAFE_CONFIG.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "380px" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[20%] contrast-[105%]"
            />

            {/* Overlay Banner */}
            <div className="absolute top-4 left-4 bg-[#FAF7F2]/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#E8DFD3] shadow-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-[#1C241E]">Open Today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from "react";
import { CAFE_CONFIG, getWhatsAppLink, getCallLink } from "../data/cafeConfig";
import { MessageCircle, Phone, Clock, Sparkles } from "lucide-react";

export const OrderCTA: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-[#3C2A22] text-[#FAF7F2] relative overflow-hidden">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#C59F54]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#26332A]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-[#EFE9DE] mb-6 text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#D8B774]" />
          <span>Direct Quick Order</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide text-white mb-4">
          CRAVING SOMETHING?
        </h2>

        <p className="font-serif italic text-lg sm:text-2xl text-[#E5DBCA] font-light max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          &ldquo;Your next favourite bite is just a message away.&rdquo;
        </p>

        <p className="text-sm sm:text-base text-[#FAF7F2]/80 max-w-lg mx-auto mb-10 font-light leading-relaxed">
          Whether you want quick takeout on your way home, a fresh dessert parcel for a movie night, or a table saved for your group — simply drop us a WhatsApp message or ring us!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-md mx-auto">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all duration-300 hover:shadow-lg shadow-black/20 flex items-center justify-center gap-2.5"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Order on WhatsApp</span>
          </a>

          <a
            href={getCallLink()}
            className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-white/20 text-xs font-semibold uppercase tracking-[0.2em] rounded-full backdrop-blur-xs transition-all duration-300 flex items-center justify-center gap-2.5"
          >
            <Phone className="w-4 h-4 text-[#D8B774]" />
            <span>Call Us</span>
          </a>
        </div>

        {/* Timings Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#E5DBCA]/70">
          <Clock className="w-3.5 h-3.5 text-[#D8B774]" />
          <span>Open Daily: {CAFE_CONFIG.timings.hours} ({CAFE_CONFIG.timings.kitchenCloses})</span>
        </div>
      </div>
    </section>
  );
};

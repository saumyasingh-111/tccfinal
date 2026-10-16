import React from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { BrandLogo } from "./BrandLogo";
import { VegBadge } from "./VegBadge";
import { ArrowUp, Lock } from "lucide-react";

export const Footer: React.FC = () => {
  const { cafeInfo } = useData();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/our-story" },
    { name: "Menu", path: "/menu" },
    { name: "Order Online", path: "/order" },
    { name: "Gifting", path: "/gifting" },
    { name: "Gallery", path: "/gallery" },
    { name: "Visit Us", path: "/visit-us" },
  ];

  const menuCategories = [
    { name: "Signature Desserts", path: "/menu?category=signature-desserts" },
    { name: "Beverages", path: "/menu?category=beverages" },
    { name: "Sandwiches & Maggie", path: "/menu?category=sandwiches-maggie" },
    { name: "Burgers & Fries", path: "/menu?category=burgers-fries" },
    { name: "Momos", path: "/menu?category=momo" },
    { name: "Quick Bites", path: "/menu?category=quick-bites" },
  ];

  return (
    <footer className="bg-[#0F3A23] text-[#FAF6F0] border-t border-white/10 pt-16 pb-24 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4 text-left">
            <Link to="/" className="inline-block mb-1 group" title="The Classic Crush Home">
              <BrandLogo size="lg" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-2xl font-bold tracking-[0.14em] uppercase text-white">
                THE CLASSIC CRUSH
              </span>
              <VegBadge size="sm" />
            </div>
            <p className="text-xs font-semibold tracking-[0.34em] uppercase text-[#D4A359]">
              BAKERY &amp; CAFÉ
            </p>
            <p className="font-serif italic text-base text-[#FAF6F0]/90">
              &ldquo;Freshly baked, thoughtfully brewed, and made to be shared.&rdquo;
            </p>
            <p className="text-xs text-[#FAF6F0]/70 font-light max-w-sm leading-relaxed">
              Your neighbourhood 100% pure vegetarian sanctuary for warm baked patties, thick blended shakes, artisan pizzas, and sweet chocolate cravings.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-medium tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]" />
              <span>Open Daily: {cafeInfo.timings.hours}</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3 text-left">
            <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-[#D4A359]">
              Explore
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-xs sm:text-sm text-[#FAF6F0]/80 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu Highlights */}
          <div className="md:col-span-4 space-y-3 text-left">
            <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-[#D4A359]">
              Menu Highlights
            </h4>
            <ul className="space-y-2">
              {menuCategories.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-xs sm:text-sm text-[#FAF6F0]/80 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF6F0]/60 font-light">
          <p>© {new Date().getFullYear()} The Classic Crush — Bakery &amp; Café. All rights reserved. 100% Pure Vegetarian.</p>

          <div className="flex items-center gap-5">
            {/* Subtle Admin Link */}
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-[11px] text-[#FAF6F0]/50 hover:text-[#D4A359] transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Portal</span>
            </Link>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs text-[#FAF6F0]/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

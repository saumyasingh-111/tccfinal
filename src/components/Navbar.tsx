import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { AwningStrip } from "./AwningStrip";
import { useOrder } from "../context/OrderContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { Menu, X, ShoppingBag, ArrowRight, User } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount, openDrawer } = useOrder();
  const { user, customerProfile, isAuthenticated } = useCustomerAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/our-story" },
    { name: "Menu", path: "/menu" },
    { name: "Gifting", path: "/gifting" },
    { name: "Gallery", path: "/gallery" },
    { name: "Visit Us", path: "/visit-us" },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-[#F5EFEB]/95 backdrop-blur-md border-b border-[#E2D9CC]/80 transition-all shadow-xs">
      {/* 1. Authentic Top Awning Valence Trim (Matching Reference Screenshot & Cover) */}
      <AwningStrip height={13} className="bg-[#FAF6F0]" />

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 lg:h-22">
          {/* Left: Official Circular Brand Logo */}
          <NavLink
            to="/"
            className="group flex items-center transition-transform hover:scale-[1.01] py-1"
            onClick={() => setMobileMenuOpen(false)}
            title="The Classic Crush — Bakery & Café"
            aria-label="The Classic Crush Home"
          >
            <BrandLogo size="md" />
          </NavLink>

          {/* Right: Horizontal Navigation Links & Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-5 lg:gap-6">
            {/* Horizontal Nav Links in Classic Serif Typography (matching Reference) */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 font-serif">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `text-base lg:text-[17px] tracking-[0.02em] transition-all duration-200 py-1 font-medium relative ${
                      isActive
                        ? "text-[#0F3A23] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#0F3A23]"
                        : "text-[#162820]/80 hover:text-[#0F3A23] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-transparent hover:after:bg-[#0F3A23]/30"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Customer Authentication & Profile Icon */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#FAF6F0] hover:bg-[#E8DFD1] text-[#0F3A23] border border-[#E2D9CC] transition-colors text-xs font-semibold shadow-2xs"
                title="My Profile & Orders"
              >
                <div className="w-6 h-6 rounded-full bg-[#0F3A23] text-white flex items-center justify-center text-[11px] font-serif font-bold">
                  {(customerProfile?.name || user?.displayName || "U").charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline-block max-w-[90px] truncate">
                  {customerProfile?.name ? customerProfile.name.split(" ")[0] : "Profile"}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0F3A23] hover:bg-[#E8DFD1]/60 transition-colors border border-transparent hover:border-[#E2D9CC]"
                title="Customer Sign In"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Shopping Bag Button with Live Counter Badge */}
            <button
              onClick={openDrawer}
              className="relative p-2.5 rounded-full bg-[#E8DFD1]/80 text-[#0F3A23] hover:bg-[#E8DFD1] transition-all duration-200 cursor-pointer"
              title="View your order cart"
              aria-label="View order bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0F3A23] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#F5EFEB] shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Signature "Order Now →" Forest Green Pill Button */}
            <button
              onClick={openDrawer}
              className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] rounded-full bg-[#0F3A23] text-[#FAF6F0] hover:bg-[#154D30] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#0F3A23] hover:bg-[#E8DFD1]/60 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF6F0] border-t border-[#E2D9CC] px-5 py-6 space-y-4 animate-hero-fade shadow-lg">
          <div className="flex flex-col space-y-1.5 font-serif">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base tracking-[0.02em] py-2.5 px-3.5 rounded-lg transition-colors font-medium ${
                    isActive
                      ? "bg-[#0F3A23] text-white font-semibold"
                      : "text-[#162820] hover:bg-[#E8DFD1]/60 hover:text-[#0F3A23]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Customer Account Mobile Link */}
            {isAuthenticated ? (
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base tracking-[0.02em] py-2.5 px-3.5 rounded-lg transition-colors font-medium flex items-center justify-between ${
                    isActive
                      ? "bg-[#0F3A23] text-white font-semibold"
                      : "text-[#0F3A23] bg-[#E8DFD1]/50 hover:bg-[#E8DFD1] font-semibold"
                  }`
                }
              >
                <span>My Profile & Orders</span>
                <span className="text-xs bg-[#0F3A23] text-white px-2 py-0.5 rounded-full font-serif">
                  {(customerProfile?.name || user?.displayName || "U").charAt(0).toUpperCase()}
                </span>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base tracking-[0.02em] py-2.5 px-3.5 rounded-lg transition-colors font-medium flex items-center justify-between ${
                    isActive
                      ? "bg-[#0F3A23] text-white font-semibold"
                      : "text-[#0F3A23] bg-[#E8DFD1]/50 hover:bg-[#E8DFD1] font-semibold"
                  }`
                }
              >
                <span>Customer Sign In</span>
                <User className="w-4 h-4 text-[#0F3A23]" />
              </NavLink>
            )}
          </div>

          <div className="pt-3 border-t border-[#E2D9CC] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openDrawer();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-[0.16em] rounded-full shadow-sm hover:bg-[#154D30] transition-colors cursor-pointer"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 border border-[#0F3A23] text-[#0F3A23] text-xs font-semibold uppercase tracking-[0.16em] rounded-full hover:bg-[#0F3A23]/5 transition-colors"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

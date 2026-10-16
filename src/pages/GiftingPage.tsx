import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useOrder } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import {
  Gift,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Clock,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";

/**
 * 12 Illustrated Category SVGs
 * Thin dark outlines (#064F50), restrained golden-yellow accents (#E8C45A),
 * refined editorial café aesthetic matching reference screenshot.
 */
const CategoryIcons: Record<string, React.FC<{ className?: string }>> = {
  // 1. Birthday: Gift box with candle & golden flame
  birthday: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Box */}
      <rect x="12" y="24" width="40" height="32" rx="4" />
      <path d="M10 24h44v8H10z" />
      {/* Vertical ribbon */}
      <line x1="32" y1="24" x2="32" y2="56" />
      {/* Golden ribbon knot */}
      <path d="M32 24c-4-6-10-8-12-4s2 10 12 4z" fill="#C99742" stroke="#0F3A23" />
      <path d="M32 24c4-6 10-8 12-4s-2 10-12 4z" fill="#C99742" stroke="#0F3A23" />
      {/* Birthday candle atop */}
      <line x1="32" y1="12" x2="32" y2="20" strokeWidth="2" />
      {/* Golden candle flame */}
      <path d="M32 6c-2.5 3-2 5 0 6 2-1 2.5-3 0-6z" fill="#C99742" stroke="#C99742" />
      {/* Sparkles */}
      <path d="M16 14l1.5 1.5M17.5 14L16 15.5" stroke="#C99742" strokeWidth="1.5" />
      <path d="M48 14l1.5 1.5M49.5 14L48 15.5" stroke="#C99742" strokeWidth="1.5" />
    </svg>
  ),

  // 2. Same Day: Quick delivery scooter with parcel & golden speed lines
  "same-day": ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Wheels */}
      <circle cx="20" cy="46" r="6" />
      <circle cx="48" cy="46" r="6" />
      <circle cx="20" cy="46" r="2" fill="#C99742" stroke="#0F3A23" />
      <circle cx="48" cy="46" r="2" fill="#C99742" stroke="#0F3A23" />
      {/* Scooter frame */}
      <path d="M26 46h16l4-16h-8l-8 16" />
      <path d="M42 30l3-12h4" />
      {/* Delivery box on rear rack with gold accent */}
      <rect x="14" y="24" width="12" height="14" rx="2" fill="#C99742" stroke="#0F3A23" />
      <line x1="20" y1="24" x2="20" y2="38" />
      {/* Handlebar & windshield */}
      <path d="M49 18h4" />
      {/* Motion / speed lines */}
      <line x1="6" y1="38" x2="11" y2="38" stroke="#C99742" strokeWidth="2" />
      <line x1="8" y1="44" x2="12" y2="44" stroke="#C99742" strokeWidth="2" />
      <circle cx="53" cy="24" r="2" fill="#C99742" stroke="#C99742" />
    </svg>
  ),

  // 3. Flowers: Tied floral bouquet with golden ribbon
  flowers: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Wrapped parchment cone */}
      <path d="M24 38l8 20 8-20z" />
      <line x1="32" y1="38" x2="32" y2="58" />
      {/* Golden ribbon knot */}
      <path d="M32 40c-3-2-6-1-5 2s5 0 5-2zm0 0c3-2 6-1 5 2s-5 0-5-2z" fill="#C99742" stroke="#0F3A23" />
      <path d="M30 42l-4 8M34 42l4 8" stroke="#C99742" strokeWidth="1.6" />
      {/* Blooms */}
      <circle cx="32" cy="22" r="8" fill="#FAF6F0" />
      <path d="M32 18c-3 0-5 2-5 4s4 4 5 4 5-2 5-4-2-4-5-4z" fill="#C99742" stroke="#0F3A23" />
      <circle cx="20" cy="28" r="7" />
      <path d="M20 25a3 3 0 100 6 3 3 0 000-6z" fill="#C99742" />
      <circle cx="44" cy="28" r="7" />
      <path d="M44 25a3 3 0 100 6 3 3 0 000-6z" fill="#C99742" />
      {/* Little accent leaves */}
      <path d="M12 24c4-2 8 0 8 4M52 24c-4-2-8 0-8 4" stroke="#0F3A23" />
    </svg>
  ),

  // 4. Cakes & Desserts: Tiered celebration cake with candle
  cakes: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Cake Stand */}
      <path d="M14 54h36M32 54v4M24 58h16" />
      {/* Bottom tier */}
      <rect x="18" y="38" width="28" height="16" rx="3" />
      <path d="M18 43c4 2 8-2 14 0s8-2 14 0" />
      {/* Top tier */}
      <rect x="23" y="24" width="18" height="14" rx="2" />
      <path d="M23 28c3 2 6-2 9 0s6-2 9 0" />
      {/* Golden candle flame */}
      <line x1="32" y1="16" x2="32" y2="24" strokeWidth="1.8" />
      <path d="M32 10c-2 2-1.5 4 0 5 1.5-1 2-3 0-5z" fill="#C99742" stroke="#C99742" />
      {/* Golden decorative berries */}
      <circle cx="23" cy="24" r="1.8" fill="#C99742" stroke="#0F3A23" />
      <circle cx="41" cy="24" r="1.8" fill="#C99742" stroke="#0F3A23" />
      <circle cx="18" cy="38" r="1.8" fill="#C99742" stroke="#0F3A23" />
      <circle cx="46" cy="38" r="1.8" fill="#C99742" stroke="#0F3A23" />
    </svg>
  ),

  // 5. Personalised Gifts: Polaroid easel frame with heart & sparkle
  personalised: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Frame */}
      <rect x="16" y="14" width="32" height="40" rx="3" />
      {/* Picture window */}
      <rect x="20" y="18" width="24" height="24" rx="1" fill="#FAF6F0" />
      {/* Sun / hills inside picture */}
      <circle cx="26" cy="25" r="2.5" fill="#C99742" stroke="#0F3A23" />
      <path d="M21 38l7-8 6 6 4-4 6 6" />
      {/* Heart clip on top */}
      <path d="M32 14c-1.5-2.5-4.5-2.5-6 0s2 5 6 7c4-2 7.5-4.5 6-7s-4.5-2.5-6 0z" fill="#C99742" stroke="#0F3A23" />
      {/* Text lines at bottom */}
      <line x1="22" y1="46" x2="36" y2="46" strokeWidth="1.5" />
      <line x1="22" y1="50" x2="30" y2="50" strokeWidth="1.5" />
      {/* Sparkles */}
      <path d="M48 20l2 2M50 20l-2 2" stroke="#C99742" strokeWidth="1.6" />
    </svg>
  ),

  // 6. Plants: Potted monstera/succulent with golden rim
  plants: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Pot */}
      <path d="M20 38h24l-4 18H24z" />
      {/* Pot Golden Rim */}
      <rect x="18" y="34" width="28" height="5" rx="1.5" fill="#C99742" stroke="#0F3A23" />
      {/* Vertical fluting */}
      <line x1="28" y1="39" x2="29" y2="54" strokeWidth="1.2" />
      <line x1="36" y1="39" x2="35" y2="54" strokeWidth="1.2" />
      {/* Leaves */}
      <path d="M32 34V14" strokeWidth="2" />
      <path d="M32 14c-6-4-14 0-14 8s10 10 14 12" fill="#FAF6F0" />
      <path d="M32 14c6-4 14 0 14 8s-10 10-14 12" fill="#FAF6F0" />
      <path d="M32 10c0-6 4-8 8-8s4 6 0 8" fill="#C99742" stroke="#0F3A23" />
      <path d="M24 22c-4-4-2-8 2-8" stroke="#0F3A23" />
      <path d="M40 22c4-4 2-8-2-8" stroke="#0F3A23" />
    </svg>
  ),

  // 7. Chocolates: Heart chocolate box with ribbon & bonbons
  chocolates: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Heart box */}
      <path
        d="M32 54S12 42 12 26a10 10 0 0118-6c1 1 2 2 2 2s1-1 2-2a10 10 0 0118 6c0 16-20 28-20 28z"
        fill="#FAF6F0"
      />
      {/* Diagonal golden ribbon */}
      <path d="M22 17l24 24" stroke="#C99742" strokeWidth="2.5" />
      {/* Ribbon bow knot */}
      <circle cx="34" cy="29" r="3.5" fill="#C99742" stroke="#0F3A23" />
      {/* Bonbons inside */}
      <circle cx="23" cy="30" r="3" fill="#C99742" stroke="#0F3A23" />
      <circle cx="41" cy="24" r="3" />
      <circle cx="32" cy="42" r="3" fill="#0F3A23" />
      {/* Sparkles */}
      <path d="M49 14l1.5 1.5M50.5 14L49 15.5" stroke="#C99742" strokeWidth="1.5" />
    </svg>
  ),

  // 8. Gift Hampers: Woven wicker basket overflowing with goodies
  hampers: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Handle */}
      <path d="M18 36C18 20 46 20 46 36" strokeWidth="2" />
      {/* Golden ribbon on handle */}
      <path d="M32 20c-3-2-6-1-5 2s5 0 5-2zm0 0c3-2 6-1 5 2s-5 0-5-2z" fill="#C99742" stroke="#0F3A23" />
      {/* Basket base */}
      <path d="M12 36h40l-5 20H17z" />
      {/* Wicker crosshatch */}
      <line x1="12" y1="42" x2="52" y2="42" />
      <line x1="15" y1="48" x2="49" y2="48" />
      <line x1="22" y1="36" x2="20" y2="56" />
      <line x1="32" y1="36" x2="32" y2="56" />
      <line x1="42" y1="36" x2="44" y2="56" />
      {/* Items in basket */}
      <rect x="22" y="24" width="8" height="14" rx="2" fill="#C99742" stroke="#0F3A23" />
      <circle cx="37" cy="32" r="4" fill="#FAF6F0" />
      <path d="M37 26v4M35 28h4" stroke="#0F3A23" />
      <path d="M41 22l4 14" stroke="#0F3A23" strokeWidth="2" />
    </svg>
  ),

  // 9. Balloon Decor: Cluster of helium balloons with ribbons & stars
  balloons: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Middle Balloon (Golden) */}
      <ellipse cx="32" cy="22" rx="9" ry="12" fill="#C99742" stroke="#0F3A23" />
      <path d="M30 34l4 0-2 2z" fill="#0F3A23" />
      {/* Left Balloon */}
      <ellipse cx="21" cy="26" rx="8" ry="11" fill="#FAF6F0" />
      <path d="M19 37l4 0-2 2z" fill="#0F3A23" />
      {/* Right Balloon */}
      <ellipse cx="43" cy="26" rx="8" ry="11" fill="#FAF6F0" />
      <path d="M41 37l4 0-2 2z" fill="#0F3A23" />
      {/* Curly strings */}
      <path d="M32 36c-2 6 3 10 0 18" stroke="#0F3A23" strokeWidth="1.5" />
      <path d="M21 39c-3 4 1 8-2 15" stroke="#0F3A23" strokeWidth="1.5" />
      <path d="M43 39c3 4-1 8 2 15" stroke="#0F3A23" strokeWidth="1.5" />
      {/* Sparkles / Confetti */}
      <circle cx="12" cy="18" r="1.5" fill="#C99742" />
      <circle cx="50" cy="14" r="1.5" fill="#C99742" />
      <path d="M35 14a2 5 0 01-3 0" stroke="#0F3A23" strokeWidth="1.2" />
    </svg>
  ),

  // 10. Corporate Gifts: Sleek executive gift box with golden seal & tag
  corporate: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Gift Chest */}
      <rect x="14" y="24" width="36" height="30" rx="3" />
      <path d="M12 24h40v8H12z" />
      {/* Ribbon */}
      <line x1="32" y1="24" x2="32" y2="54" />
      {/* Golden Seal Tag */}
      <circle cx="32" cy="38" r="5" fill="#C99742" stroke="#0F3A23" />
      <path d="M32 35v6M29 38h6" stroke="#0F3A23" strokeWidth="1.2" />
      {/* Ribbon Knot atop */}
      <path d="M32 24c-3-3-8-4-9-1s2 6 9 1zm0 0c3-3 8-4 9-1s-2 6-9 1z" fill="#C99742" stroke="#0F3A23" />
      {/* Executive Pen beside */}
      <line x1="48" y1="12" x2="52" y2="34" strokeWidth="1.8" />
      <path d="M48 12l2-4 2 4z" fill="#C99742" stroke="#0F3A23" />
    </svg>
  ),

  // 11. Trending Gifts: Trending flame / badge with golden crown star
  trending: ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Flame Outline */}
      <path
        d="M32 10c2 7 8 11 8 19 0 9-7 17-16 17s-14-8-14-17c0-8 6-13 10-17 1 6 4 9 7 9 3 0 5-4 5-11z"
        fill="#FAF6F0"
      />
      {/* Inner Golden Flame */}
      <path
        d="M32 24c1.5 4 5 7 5 11 0 5-4 9-9 9s-8-4-8-9c0-5 3-7 5-9 1 3 3 5 4 5 2 0 3-3 3-7z"
        fill="#C99742"
        stroke="#0F3A23"
      />
      {/* Golden Star Sparkle on top */}
      <path d="M44 14l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#C99742" stroke="#C99742" />
      <path d="M48 30l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#C99742" stroke="#C99742" />
    </svg>
  ),

  // 12. Café Gift Boxes: Steaming coffee cup + artisan sweet box
  "cafe-boxes": ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="#0F3A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Coffee Cup */}
      <path d="M16 28h18v12a9 9 0 01-18 0V28z" />
      {/* Cup Handle */}
      <path d="M34 31h4a4 4 0 010 8h-4" />
      {/* Cup Saucer */}
      <path d="M12 44h26" strokeWidth="2" />
      {/* Golden Aroma steam */}
      <path d="M22 16c0 4-2 6-2 10M28 14c0 4-2 6-2 10" stroke="#C99742" strokeWidth="1.8" />
      {/* Bakery gift box behind */}
      <rect x="34" y="20" width="18" height="24" rx="2" fill="#FAF6F0" stroke="#0F3A23" />
      <line x1="43" y1="20" x2="43" y2="44" stroke="#C99742" strokeWidth="1.8" />
      <path d="M43 20c-2-2-4-2-4 0s4 2 4 0zm0 0c2-2 4-2 4 0s-4 2-4 0z" fill="#C99742" stroke="#0F3A23" />
      <circle cx="43" cy="30" r="1.5" fill="#C99742" />
    </svg>
  ),
};

interface OccasionBanner {
  id: string;
  title: string;
  dateBadge?: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  image: string;
  filterOccasion: string;
  description: string;
}

export const GiftingPage: React.FC = () => {
  const { giftProducts } = useData();
  const { addGiftToOrder } = useOrder();
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const occasionScrollRef = useRef<HTMLDivElement>(null);

  // 12 Illustrated Categories as requested
  const navigationCategories = [
    { id: "birthday", label: "Birthday", filterType: "occasion", value: "Birthdays" },
    { id: "same-day", label: "Same Day", filterType: "sameday", value: "same-day" },
    { id: "flowers", label: "Flowers", filterType: "category", value: "fresh-flower-bouquets" },
    { id: "cakes", label: "Cakes & Desserts", filterType: "category", value: "dessert-sweet-boxes" },
    { id: "personalised", label: "Personalised Gifts", filterType: "category", value: "personalised-gifts" },
    { id: "plants", label: "Plants", filterType: "category", value: "plants-botanicals" },
    { id: "chocolates", label: "Chocolates", filterType: "category", value: "chocolate-hampers" },
    { id: "hampers", label: "Gift Hampers", filterType: "category", value: "gift-hampers" },
    { id: "balloons", label: "Balloon Decor", filterType: "category", value: "balloon-decor" },
    { id: "corporate", label: "Corporate Gifts", filterType: "category", value: "corporate-boss-day" },
    { id: "trending", label: "Trending Gifts", filterType: "featured", value: "featured" },
    { id: "cafe-boxes", label: "Café Gift Boxes", filterType: "category", value: "just-because-gifts" },
  ];

  // Gifts For Every Occasion Banners (faithful to the reference screenshot proportions and colors)
  const occasionBanners: OccasionBanner[] = [
    {
      id: "birthday",
      title: "Birthday",
      bgColor: "bg-[#FAD2B8]",
      textColor: "text-[#2C201A]",
      accentColor: "#D97706",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
      filterOccasion: "Birthdays",
      description: "Artisan chocolate cakes, candles & confetti smiles",
    },
    {
      id: "boss-day",
      title: "Boss Day",
      dateBadge: "16TH OCT",
      bgColor: "bg-[#E6D7C3]",
      textColor: "text-[#162820]",
      accentColor: "#0F3A23",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      filterOccasion: "Boss Day",
      description: "Ceramic keepsake mugs, coffee drippers & desk gifts",
    },
    {
      id: "anniversary",
      title: "Anniversary",
      bgColor: "bg-[#F7D2DC]",
      textColor: "text-[#162820]",
      accentColor: "#8C1D24",
      image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      filterOccasion: "Anniversaries",
      description: "Dutch red roses, heart chocolate boxes & romantic cards",
    },
    {
      id: "diwali",
      title: "Diwali",
      dateBadge: "8TH NOV",
      bgColor: "bg-[#8C1D24]",
      textColor: "text-white",
      accentColor: "#C99742",
      image: "https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?auto=format&fit=crop&w=800&q=80",
      filterOccasion: "Diwali",
      description: "Regal dry-fruit mithai, solid brass diyas & festive hampers",
    },
    {
      id: "congratulations",
      title: "Congratulations",
      dateBadge: "CELEBRATE",
      bgColor: "bg-[#E6F0EB]",
      textColor: "text-[#0F3A23]",
      accentColor: "#0F3A23",
      image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80",
      filterOccasion: "Congratulations",
      description: "Vibrant flower posies, gourmet cookies & joyful cheer",
    },
  ];

  // Catalogue Occasion Filters
  const occasionTabs = [
    "All",
    "Birthdays",
    "Anniversaries",
    "Boss Day",
    "Diwali",
    "Congratulations",
    "Thank You",
    "Friendship",
    "Just Because",
  ];

  // Scroll Helpers
  const scrollCategoryStrip = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const scrollOccasionBanners = (direction: "left" | "right") => {
    if (occasionScrollRef.current) {
      const offset = direction === "left" ? -340 : 340;
      occasionScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Click on horizontal category icon
  const handleNavCategoryClick = (cat: typeof navigationCategories[0]) => {
    if (cat.filterType === "occasion") {
      setSelectedOccasion(cat.value);
      setSelectedCategory("all");
    } else if (cat.filterType === "category") {
      setSelectedCategory(cat.value);
      setSelectedOccasion("all");
    } else if (cat.filterType === "sameday") {
      setSelectedCategory("sameday");
      setSelectedOccasion("all");
    } else if (cat.filterType === "featured") {
      setSelectedCategory("featured");
      setSelectedOccasion("all");
    }

    // Smoothly scroll down slightly to catalogue if needed
    const catalogueEl = document.getElementById("gifting-catalogue");
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Click on occasion banner
  const handleOccasionBannerClick = (occ: string) => {
    setSelectedOccasion(occ);
    setSelectedCategory("all");
    const catalogueEl = document.getElementById("gifting-catalogue");
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedOccasion("all");
    setSortBy("featured");
  };

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    let result = giftProducts.filter((product) => {
      // Category match
      let matchCat = true;
      if (selectedCategory === "all") {
        matchCat = true;
      } else if (selectedCategory === "sameday") {
        matchCat =
          product.advanceNotice?.toLowerCase().includes("same-day") ||
          product.advanceNotice?.toLowerCase().includes("ready") ||
          product.deliveryEnabled;
      } else if (selectedCategory === "featured") {
        matchCat = !!product.isFeatured;
      } else {
        matchCat =
          product.categoryId === selectedCategory ||
          (selectedCategory === "gift-hampers" &&
            (product.categoryId === "chocolate-hampers" ||
              product.categoryId === "flowers-chocolates-combos"));
      }

      // Occasion match
      let matchOccasion = true;
      if (selectedOccasion !== "all") {
        matchOccasion = product.occasions.includes(selectedOccasion);
      }

      return matchCat && matchOccasion;
    });

    // Sorting
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [giftProducts, selectedCategory, selectedOccasion, sortBy]);

  // Quick Add to Cart
  const handleQuickAdd = (product: typeof giftProducts[0], e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.isAvailable) return;

    addGiftToOrder({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      isCustomGift: false,
    });
    showToast(`"${product.name}" added to your bag.`);
  };

  const isFiltered = selectedCategory !== "all" || selectedOccasion !== "all";

  return (
    <div className="bg-[#F5EFEB] text-[#162820] min-h-screen">
      {/* ==============================================================
          A. HORIZONTAL ILLUSTRATED CATEGORY STRIP
          Scrollable strip with 12 illustrated SVG icons, thin outlines,
          golden-yellow accents, desktop arrows, and mobile swipe.
          ============================================================== */}
      <section className="bg-[#FAF6F0] border-b border-[#E2D9CC] pt-6 pb-6 sm:pt-8 sm:pb-8 shadow-2xs relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section header info */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C99742]" />
              <span className="text-[11px] font-semibold tracking-[0.26em] uppercase text-[#0F3A23]">
                Curated Gifting Collections
              </span>
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollCategoryStrip("left")}
                className="p-1.5 rounded-full border border-[#E2D9CC] hover:border-[#0F3A23] hover:bg-white text-[#0F3A23] transition-colors cursor-pointer shadow-2xs"
                title="Scroll previous categories"
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCategoryStrip("right")}
                className="p-1.5 rounded-full border border-[#E2D9CC] hover:border-[#0F3A23] hover:bg-white text-[#0F3A23] transition-colors cursor-pointer shadow-2xs"
                title="Scroll next categories"
                aria-label="Next categories"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Categories Row */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
          >
            {navigationCategories.map((cat) => {
              const IconComponent = CategoryIcons[cat.id] || CategoryIcons.birthday;
              const isActive =
                (cat.filterType === "occasion" && selectedOccasion === cat.value) ||
                (cat.filterType === "category" && selectedCategory === cat.value) ||
                (cat.filterType === "sameday" && selectedCategory === "sameday") ||
                (cat.filterType === "featured" && selectedCategory === "featured");

              return (
                <button
                  key={cat.id}
                  onClick={() => handleNavCategoryClick(cat)}
                  className="group flex flex-col items-center shrink-0 cursor-pointer transition-all duration-200 focus:outline-none"
                  aria-pressed={isActive}
                >
                  {/* Illustrated Icon Container */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-[#0F3A23] text-[#C99742] shadow-md ring-2 ring-[#0F3A23] ring-offset-2 scale-105"
                        : "bg-white text-[#0F3A23] border border-[#E2D9CC] group-hover:border-[#0F3A23] group-hover:shadow-md group-hover:-translate-y-1"
                    }`}
                  >
                    <IconComponent
                      className={`w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-300 group-hover:scale-108 ${
                        isActive ? "[&_svg]:stroke-white" : ""
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[11px] sm:text-xs font-semibold tracking-wide text-center whitespace-nowrap mt-2.5 transition-colors ${
                      isActive
                        ? "text-[#0F3A23] font-bold underline decoration-[#C99742] decoration-2 underline-offset-4"
                        : "text-[#6E776F] group-hover:text-[#0F3A23]"
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==============================================================
          B. “GIFTS FOR EVERY OCCASION” SECTION
          Directly below category strip. Large, colorful photographic occasion
          banners following the proportions and layout of reference screenshot.
          ============================================================== */}
      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#0F3A23] block mb-1">
              Thoughtful Surprises
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F3A23] tracking-tight">
              Gifts For Every Occasion
            </h2>
          </div>

          {/* Desktop Banner Carousel Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollOccasionBanners("left")}
              className="p-2 rounded-full border border-[#E2D9CC] hover:border-[#0F3A23] bg-white text-[#0F3A23] shadow-xs cursor-pointer transition-colors"
              title="Previous occasions"
              aria-label="Previous occasions"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollOccasionBanners("right")}
              className="p-2 rounded-full border border-[#E2D9CC] hover:border-[#0F3A23] bg-white text-[#0F3A23] shadow-xs cursor-pointer transition-colors"
              title="Next occasions"
              aria-label="Next occasions"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wide Horizontally Arranged Photographic Banners */}
        <div
          ref={occasionScrollRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1"
        >
          {occasionBanners.map((banner) => {
            const isSelected = selectedOccasion === banner.filterOccasion;
            return (
              <div
                key={banner.id}
                onClick={() => handleOccasionBannerClick(banner.filterOccasion)}
                className={`group relative min-w-[270px] sm:min-w-[320px] md:min-w-[360px] flex-1 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
                  banner.bgColor
                } ${isSelected ? "ring-3 ring-[#0F3A23] shadow-lg" : ""}`}
              >
                {/* Top Bar with Optional Date Badge & Arrow */}
                <div className="p-5 sm:p-6 pb-2 flex items-start justify-between z-10">
                  <div>
                    {banner.dateBadge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-black/10 backdrop-blur-xs text-current mb-1.5 border border-black/5">
                        {banner.dateBadge}
                      </span>
                    )}
                    <h3
                      className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-1.5 ${banner.textColor}`}
                    >
                      <span>{banner.title}</span>
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </h3>
                  </div>

                  {isSelected && (
                    <span className="px-2.5 py-1 rounded-full bg-[#0F3A23] text-[#C99742] text-[10px] font-bold tracking-wider uppercase shadow-xs">
                      Active
                    </span>
                  )}
                </div>

                {/* Subtitle / Description */}
                <div className="px-5 sm:px-6 z-10">
                  <p className={`text-xs font-light line-clamp-1 opacity-80 ${banner.textColor}`}>
                    {banner.description}
                  </p>
                </div>

                {/* Photographic Art with Seamless Integration */}
                <div className="relative mt-4 aspect-16/10 sm:aspect-16/9 w-full overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==============================================================
          C. GIFTING PRODUCT CATALOGUE DIRECTLY CONTINUES
          Filters, sorting, product grid, details, and Add to Bag.
          ============================================================== */}
      <section id="gifting-catalogue" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        {/* Active Filter Indicator Pill (if filtered) */}
        {isFiltered && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-[#E2D9CC] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0F3A23] uppercase tracking-wider">
                Currently Filtering:
              </span>
              {selectedOccasion !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0F3A23] text-white text-xs font-medium">
                  Occasion: {selectedOccasion}
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0F3A23] text-white text-xs font-medium">
                  Category: {selectedCategory.replace(/-/g, " ")}
                </span>
              )}
              <span className="text-xs text-[#6E776F] font-light">
                ({filteredProducts.length} items found)
              </span>
            </div>

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#0F3A23] hover:bg-[#FAF6F0] border border-[#E2D9CC] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {/* Filters and Sorting Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E2D9CC]">
          {/* Occasion Chips Bar */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
            <span className="text-xs font-semibold text-[#0F3A23] uppercase tracking-wider mr-1 hidden lg:inline shrink-0">
              Occasion:
            </span>
            {occasionTabs.map((occ) => {
              const val = occ === "All" ? "all" : occ;
              const isSelected = selectedOccasion === val;
              return (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(val)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0F3A23] text-white shadow-2xs font-semibold"
                      : "bg-white text-[#162820] hover:bg-[#FAF6F0] border border-[#E2D9CC]"
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6E776F]" />
            <span className="text-xs text-[#6E776F] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white border border-[#E2D9CC] rounded-full px-3 py-1.5 text-[#0F3A23] focus:outline-none focus:ring-1 focus:ring-[#0F3A23] cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E2D9CC] max-w-md mx-auto p-8 shadow-xs">
            <Gift className="w-12 h-12 text-[#E2D9CC] mx-auto mb-3" />
            <h3 className="font-serif text-xl text-[#0F3A23] font-bold">No gifts found</h3>
            <p className="text-xs text-[#6E776F] mt-1 max-w-xs mx-auto">
              We couldn&apos;t find products matching your active filters. Try resetting to view our full collection.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E2D9CC] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Pinterest-Style Photography */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-[#FAF6F0]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />

                    {/* Occasion Tag */}
                    {product.occasions[0] && (
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#0F3A23] shadow-xs">
                        {product.occasions[0]}
                      </span>
                    )}

                    {/* Price Pill */}
                    <span className="absolute bottom-3 right-3 bg-[#0F3A23]/95 text-white backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold font-serif shadow-xs">
                      {product.priceDisplay || `₹${product.price}`}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 space-y-2.5">
                    {/* Advance Notice / Delivery Pill */}
                    {product.advanceNotice && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#0F3A23] font-medium">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="truncate">{product.advanceNotice}</span>
                      </div>
                    )}

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0F3A23] group-hover:text-[#154D30] transition-colors leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#6E776F] font-light line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Included Items Preview */}
                    {product.includedItems && product.includedItems[0] && (
                      <div className="pt-2 text-[11px] text-[#0F3A23] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F3A23] shrink-0" />
                        <span className="truncate">{product.includedItems[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 sm:p-6 pt-0 border-t border-[#FAF6F0] mt-3 flex items-center justify-between">
                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F3A23] hover:bg-[#154D30] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>

                  <Link
                    to={`/gifting/${product.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#0F3A23] hover:text-[#154D30] transition-colors"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Hamper Builder Teaser Banner */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-r from-[#0F3A23] via-[#154D30] to-[#0F3A23] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
          {/* Subtle gold decorative rings */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-[#C99742]/20 pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full border border-[#C99742]/20 pointer-events-none" />

          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#C99742] font-semibold flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C99742]" />
              <span>Personalized Experience</span>
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Create your own bespoke gift box.
            </h3>
            <p className="text-xs sm:text-sm text-white/85 font-light leading-relaxed">
              Mix and match fresh floral stems, eggless bento cakes, dark Belgian truffles, and a handwritten card sealed with wax ribbon.
            </p>
          </div>

          <Link
            to="/gifting/build-your-gift"
            className="px-8 py-3.5 bg-[#FAF6F0] text-[#0F3A23] hover:bg-white text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all shadow-md shrink-0 z-10"
          >
            START BUILDING →
          </Link>
        </div>
      </section>

      {/* Cakes & Celebration Callout Banner matching Page 7 */}
      <CakesCelebrationBanner />
    </div>
  );
};

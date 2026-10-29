export interface GiftProduct {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  price: number;
  priceDisplay?: string;
  isPriceConfirmed: boolean;
  image: string;
  additionalImages?: string[];
  categoryId: string; // matches GiftCategory.id
  occasions: string[];
  includedItems: string[];
  isFeatured?: boolean;
  isAvailable: boolean;
  supportsPersonalMessage: boolean;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  advanceNotice?: string;
  sortOrder: number;
}

export interface GiftCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

export interface GiftAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  category: "card" | "dessert" | "chocolate" | "flowers" | "candle";
}

export interface GiftingSettings {
  isEnabled: boolean;
  whatsappNumber: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryArea: string;
  deliveryFee: number;
  advanceOrderNotice: string;
  greetingCardAvailable: boolean;
  sameDayCutoffTime: string;
}

export type GiftingOrderStatus =
  | "Pending Confirmation"
  | "Confirmed"
  | "Preparing"
  | "Ready for Pickup"
  | "Out for Delivery"
  | "Completed"
  | "Cancelled";

export interface GiftingOrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  recipientName?: string;
  giftItems: {
    giftId?: string;
    name: string;
    price: number;
    quantity: number;
    addons?: string[];
    personalMessage?: string;
    isCustom?: boolean;
    customSummary?: string;
  }[];
  fulfilmentMethod: "Pickup" | "Delivery";
  deliveryAddress?: string;
  requestedDate: string;
  requestedTime?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: GiftingOrderStatus;
  createdAt: string;
  note?: string;
}

// ----------------------------------------------------
// 1. EXACT GIFT CATEGORIES FROM MASTER PROMPT
// ----------------------------------------------------
export const GIFT_CATEGORIES: GiftCategory[] = [
  {
    id: "fresh-flower-bouquets",
    name: "Fresh Flowers",
    slug: "fresh-flower-bouquets",
    description: "Hand-tied bouquets with fresh natural blooms, pastel wrapping, and satin ribbons.",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "chocolate-hampers",
    name: "Chocolates",
    slug: "chocolate-hampers",
    description: "Curated artisanal chocolate boxes, Belgian truffles, and rich cocoa indulgence.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "dessert-sweet-boxes",
    name: "Cakes & Desserts",
    slug: "dessert-sweet-boxes",
    description: "Warm brownie tubs, signature chocolate delights, and oven-fresh bakery assortments.",
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "flowers-chocolates-combos",
    name: "Flowers & Chocolates Combos",
    slug: "flowers-chocolates-combos",
    description: "Harmonious combinations of delicate blossoms paired with handcrafted dessert boxes.",
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "birthday-surprises",
    name: "Birthday Gifts",
    slug: "birthday-surprises",
    description: "Celebration boxes with mini bento cakes, sparkler candles, and celebratory flowers.",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "gift-hampers",
    name: "Gift Hampers",
    slug: "gift-hampers",
    description: "Luxurious multi-item curated gift baskets overflowing with cafe delights and artisanal treats.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 6,
    isActive: true,
  },
  {
    id: "festive-diwali",
    name: "Festive & Diwali",
    slug: "festive-diwali",
    description: "Traditional mithai, brass diyas, dry fruits, and festive celebration hampers.",
    image: "https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 7,
    isActive: true,
  },
  {
    id: "corporate-boss-day",
    name: "Corporate & Boss Day",
    slug: "corporate-boss-day",
    description: "Sophisticated executive gift boxes with handcrafted ceramic mugs, coffee drippers, and luxury chocolates.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 8,
    isActive: true,
  },
  {
    id: "personalised-gifts",
    name: "Personalised Gifts",
    slug: "personalised-gifts",
    description: "Custom engraved keepsake frames, handwritten calligraphy letters, and custom sweet boxes.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 9,
    isActive: true,
  },
  {
    id: "plants-botanicals",
    name: "Plants",
    slug: "plants-botanicals",
    description: "Living green indoor plants in artisan ceramic pots paired with bakery treats.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 10,
    isActive: true,
  },
  {
    id: "balloon-decor",
    name: "Balloon Decor",
    slug: "balloon-decor",
    description: "Pastel balloon clusters with curling ribbons, celebration cakes, and confetti accents.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 11,
    isActive: true,
  },
  {
    id: "just-because-gifts",
    name: "Café Gift Boxes",
    slug: "just-because-gifts",
    description: "Signature cafe indulgences, warm bakes, fresh coffee beans, and sweet treats.",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 12,
    isActive: true,
  },
];

export const GIFT_OCCASIONS = [
  "Birthdays",
  "Anniversaries",
  "Boss Day",
  "Diwali",
  "Same Day",
  "Thank You",
  "Congratulations",
  "Corporate",
  "Friendship",
  "Just Because",
] as const;

export type GiftOccasion = typeof GIFT_OCCASIONS[number];

// ----------------------------------------------------
// 2. CURATED GIFT PRODUCTS
// Distinct, authentic photography with realistic floral and gifting aesthetic
// ----------------------------------------------------
export const GIFT_PRODUCTS: GiftProduct[] = [
  // --- Fresh Flower Bouquets ---
  {
    id: "pastel-romance-bouquet",
    slug: "pastel-romance-bouquet",
    name: "Pastel Whisper Bouquet",
    tagline: "Blush roses, baby's breath & delicate seasonal greens",
    description:
      "A hand-tied arrangement of soft blush roses nestled with airy baby's breath and silver eucalyptus, encased in matte ivory parchment wrapping and finished with a sage satin bow.",
    price: 499,
    priceDisplay: "₹499",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "fresh-flower-bouquets",
    occasions: ["Anniversaries", "Birthdays", "Congratulations", "Just Because"],
    includedItems: [
      "Fresh Dutch Blush Roses (6 stems)",
      "Airy White Baby's Breath Accents",
      "Signature Matte Kraft Wrapping",
      "Handwritten Calligraphy Card",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Order 3 hours in advance for same-day delivery",
    sortOrder: 1,
  },
  {
    id: "sunlit-tulips-bundle",
    slug: "sunlit-tulips-bundle",
    name: "Sunny Morning Floral Posy",
    tagline: "Vibrant yellow blooms & fresh chamomile sprigs",
    description:
      "Bright, cheerful seasonal yellow blooms and delicate chamomile sprigs arranged to bring an instant smile. Wrapped in textured organic butcher paper with natural jute twine.",
    price: 399,
    priceDisplay: "₹399",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "fresh-flower-bouquets",
    occasions: ["Thank You", "Friendship", "Just Because", "Congratulations"],
    includedItems: [
      "Golden Meadow Florals & Chamomile (10 stems)",
      "Organic Textured Wrapping",
      "Gold Foil Message Card",
    ],
    isFeatured: false,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Same-day cafe pickup available",
    sortOrder: 2,
  },

  // --- Chocolate Hampers ---
  {
    id: "artisanal-truffle-hamper",
    slug: "artisanal-truffle-hamper",
    name: "The Velvet Truffle Hamper",
    tagline: "Handcrafted Belgian chocolate truffles & hazelnut bites",
    description:
      "A rigid keepsake box lined with parchment containing an assortment of handcrafted 54% Belgian dark truffles, roasted almond clusters, and sea salt caramel bonbons.",
    price: 449,
    priceDisplay: "₹449",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "chocolate-hampers",
    occasions: ["Birthdays", "Anniversaries", "Thank You", "Friendship"],
    includedItems: [
      "Assorted Handcrafted Truffles (8 pcs)",
      "Roasted Hazelnut & Cocoa Rocks (100g)",
      "Rigid Keepsake Gift Box with Satin Ribbon",
      "Embossed Gift Note",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Instant cafe pickup or scheduled delivery",
    sortOrder: 3,
  },
  {
    id: "cocoa-crunch-box",
    slug: "cocoa-crunch-box",
    name: "Nutella & Cocoa Crunch Hamper",
    tagline: "Original Nutella jar, artisan wafers & chocolate bark",
    description:
      "Specially curated for true chocolate lovers: a mini Nutella jar paired with handcrafted dark chocolate almond bark and chocolate-dipped wafer fingers in a decorated hamper.",
    price: 349,
    priceDisplay: "₹349",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=80",
    categoryId: "chocolate-hampers",
    occasions: ["Birthdays", "Friendship", "Just Because"],
    includedItems: [
      "Original Nutella Mini Jar (180g)",
      "Belgian Dark Chocolate Bark with Toasted Almonds",
      "Crispy Chocolate Dipped Wafers",
      "Kraft Hamper Tray with Gold Shredding",
    ],
    isFeatured: false,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Same-day pickup available",
    sortOrder: 4,
  },

  // --- Dessert & Sweet Boxes ---
  {
    id: "warm-brownie-trio-box",
    slug: "warm-brownie-trio-box",
    name: "Signature Bakery Brownie Box",
    tagline: "4 rich fudge brownies with chocolate ganache drizzles",
    description:
      "Freshly baked from our cafe ovens: 4 decadent, eggless fudge brownies including Classic Walnut, Double Dark Fudge, and Salted Caramel Crunch in a chic bakery gift box.",
    price: 299,
    priceDisplay: "₹299",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "dessert-sweet-boxes",
    occasions: ["Birthdays", "Congratulations", "Thank You", "Just Because"],
    includedItems: [
      "Eggless Double Dark Brownies (2 pcs)",
      "Walnut Fudge Brownie (1 pc)",
      "Salted Caramel Swirl Brownie (1 pc)",
      "Bakery Gift Box with Signature Seal",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Baked fresh daily. Ready within 45 mins",
    sortOrder: 5,
  },
  {
    id: "delight-tasting-box",
    slug: "delight-tasting-box",
    name: "The Classic Crush Tasting Box",
    tagline: "Dark & White Delight + Oreo Dark Crunch + Korean Bun",
    description:
      "A sampler of our café's three most celebrated signatures: our warm Dark & White Delight, crunchy Oreo Dark cup, and warm garlic-cream cheese Korean Bun.",
    price: 249,
    priceDisplay: "₹249",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
    categoryId: "dessert-sweet-boxes",
    occasions: ["Friendship", "Just Because", "Birthdays"],
    includedItems: [
      "Dark & White Delight Cup",
      "Oreo Dark Crunch",
      "Korean Garlic Cream Cheese Bun",
      "Signature Presentation Box",
    ],
    isFeatured: false,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Prepared to order",
    sortOrder: 6,
  },

  // --- Flowers & Chocolates Combos ---
  {
    id: "the-classic-crush-combo",
    slug: "the-classic-crush-combo",
    name: "The Classic Crush Signature Combo",
    tagline: "Petite floral posy + box of 4 Belgian chocolates + personalized card",
    description:
      "Our most requested celebration gift: a fresh, hand-tied bouquet of sweet pastel flowers paired with an elegant gold-foiled box of 4 handmade chocolates and your custom printed message.",
    price: 599,
    priceDisplay: "₹599",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "flowers-chocolates-combos",
    occasions: ["Birthdays", "Anniversaries", "Congratulations", "Thank You"],
    includedItems: [
      "Hand-Tied Fresh Floral Bunch (Carnations, Roses, Baby's Breath)",
      "Box of 4 Handcrafted Belgian Chocolates",
      "Handwritten Calligraphy Card on Linen Paper",
      "Signature Turquoise Gift Ribbon",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Order 2 hours ahead for delivery",
    sortOrder: 7,
  },
  {
    id: "blooms-and-brownies",
    slug: "blooms-and-brownies",
    name: "Blooms & Brownie Box Duo",
    tagline: "Fresh carnation posy & warm double-fudge brownies",
    description:
      "A charming pairing of fresh pink carnations wrapped in crisp brown kraft paper, delivered alongside a pair of warm, gooey chocolate fudge brownies.",
    price: 479,
    priceDisplay: "₹479",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
    categoryId: "flowers-chocolates-combos",
    occasions: ["Birthdays", "Apologies", "Friendship", "Just Because"],
    includedItems: [
      "Fresh Carnations & Foliage Bunch",
      "Warm Eggless Double Fudge Brownies (2 pcs)",
      "Gift Packaging with Satin Bow",
    ],
    isFeatured: false,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Same-day available",
    sortOrder: 8,
  },

  // --- Birthday Surprises ---
  {
    id: "birthday-bento-celebration",
    slug: "birthday-bento-celebration",
    name: "The Birthday Bento Surprise",
    tagline: "Eggless chocolate bento cake, candle & birthday blooms",
    description:
      "A complete mini celebration in a box: an eggless chocolate truffle bento cake with celebratory piped lettering, gold taper candle, wooden dessert fork, and a mini floral sprig.",
    price: 499,
    priceDisplay: "₹499",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "birthday-surprises",
    occasions: ["Birthdays"],
    includedItems: [
      "Eggless Chocolate Truffle Bento Cake (300g)",
      "Gold Sparkler / Birthday Candle",
      "Fresh Baby's Breath Floral Accent",
      "Birthday Card with Envelope",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Same-day orders accepted (3 hours notice)",
    sortOrder: 9,
  },

  // --- Just Because Gifts ---
  {
    id: "the-sweet-note",
    slug: "the-sweet-note",
    name: "The Sweet Note",
    tagline: "Handwritten card, single rose & Belgian chocolates",
    description:
      "A gentle, heartwarming token: a single premium Dutch rose accompanied by 2 artisan Belgian truffles and a customized handwritten message on textured cream cardstock.",
    price: 199,
    priceDisplay: "₹199",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80",
    categoryId: "just-because-gifts",
    occasions: ["Just Because", "Thank You", "Friendship"],
    includedItems: [
      "Single Premium Dutch Red or Pink Rose",
      "Handcrafted Truffles (2 pcs)",
      "Handwritten Calligraphy Card",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Ready in 15 minutes at cafe counter",
    sortOrder: 10,
  },

  // --- Boss Day & Corporate ---
  {
    id: "executive-boss-day-hamper",
    slug: "executive-boss-day-hamper",
    name: "The Executive Boss Day Gift Set",
    tagline: "Ceramic keepsake mug, cafe drip coffee & dark chocolates",
    description:
      "A sophisticated desk gift arrangement: handcrafted white ceramic café mug, bespoke roast single-origin drip bags, artisan 70% dark Belgian chocolate bar, and an executive notebook with a sleek metallic pen.",
    price: 649,
    priceDisplay: "₹649",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "corporate-boss-day",
    occasions: ["Boss Day", "Corporate", "Thank You"],
    includedItems: [
      "White Ceramic Café Keepsake Mug",
      "Signature House Roast Drip Bags (3 pouches)",
      "Belgian 70% Dark Chocolate Slab (100g)",
      "Matte Hardbound Executive Notebook & Gold Pen",
      "Hot-stamped 'Thank You' Presentation Box",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Same-day courier and counter pickup",
    sortOrder: 11,
  },

  // --- Festive & Diwali ---
  {
    id: "royal-diwali-mithai-hamper",
    slug: "royal-diwali-mithai-hamper",
    name: "Royal Deepavali Celebrations Box",
    tagline: "Handcrafted dry-fruit mithai, brass diya & Belgian bonbons",
    description:
      "A radiant festive celebration gift: rich pistachio and cashew bites, handcrafted Belgian cocoa bonbons, paired with a traditional solid brass diya and natural scented soy candle nestled in a regal crimson gift chest.",
    price: 799,
    priceDisplay: "₹799",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "festive-diwali",
    occasions: ["Diwali", "Congratulations", "Thank You"],
    includedItems: [
      "Artisanal Dry-Fruit & Pistachio Bites (200g)",
      "Handcrafted Belgian Chocolate Bonbons (6 pcs)",
      "Solid Engraved Brass Diya with Ghee Wicks",
      "Sandalwood & Saffron Scented Tealight",
      "Regal Crimson & Gold Foiled Gift Chest",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Festive rush: Order 4 hours in advance",
    sortOrder: 12,
  },

  // --- Anniversary Luxury Hamper ---
  {
    id: "crimson-romance-anniversary-hamper",
    slug: "crimson-romance-anniversary-hamper",
    name: "Crimson Romance Anniversary Set",
    tagline: "Heart bouquet of Dutch red roses & velvet chocolate box",
    description:
      "The pinnacle of romantic gifting: a heart-shaped arrangement of 12 premium long-stem Dutch red roses finished with black lace organza ribbon, paired with a velvet heart box of Belgian dark truffles.",
    price: 899,
    priceDisplay: "₹899",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
    ],
    categoryId: "flowers-chocolates-combos",
    occasions: ["Anniversaries", "Birthdays"],
    includedItems: [
      "12 Long-Stem Dutch Red Roses in Lace Wrap",
      "Velvet Heart Box with 8 Belgian Dark Truffles",
      "Rose & Vanilla Aromatherapy Candle",
      "Wax-Sealed Romantic Keepsake Card",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Freshly arranged to order. 2 hours notice",
    sortOrder: 13,
  },

  // --- Plants & Botanicals ---
  {
    id: "lucky-jade-botanical-pot",
    slug: "lucky-jade-botanical-pot",
    name: "Living Jade Plant & Brownie Set",
    tagline: "Potted ceramic succulent & fresh bakery brownie duo",
    description:
      "An enduring green gift of prosperity: a healthy, potted jade plant in an artisanal fluted ceramic planter, accompanied by two fresh walnut fudge brownies and plant-care tips.",
    price: 449,
    priceDisplay: "₹449",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
    categoryId: "plants-botanicals",
    occasions: ["Congratulations", "Thank You", "Friendship", "Just Because"],
    includedItems: [
      "Healthy Live Jade Succulent in Ceramic Planter",
      "Warm Walnut Fudge Brownies (2 pcs)",
      "Botanical Care Guide & Keepsake Tag",
    ],
    isFeatured: false,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Same-day delivery available",
    sortOrder: 14,
  },

  // --- Balloon Celebration ---
  {
    id: "pastel-balloon-celebration-bundle",
    slug: "pastel-balloon-celebration-bundle",
    name: "Pastel Balloon & Bento Cake Surprise",
    tagline: "Celebration helium balloons & chocolate bento cake",
    description:
      "Instant party vibes: a cheerful bundle of pastel confetti helium balloons paired with a fresh eggless chocolate fudge bento cake, wooden cutlery, and celebratory sparkler.",
    price: 549,
    priceDisplay: "₹549",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    categoryId: "balloon-decor",
    occasions: ["Birthdays", "Anniversaries", "Congratulations"],
    includedItems: [
      "Cluster of 5 Helium Pastel & Confetti Balloons",
      "Eggless Chocolate Fudge Bento Cake (300g)",
      "Gold Sparkler Candle & Paper Bunting",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Requires 2 hours notice for balloon inflation",
    sortOrder: 15,
  },

  // --- Personalised Gifts ---
  {
    id: "custom-polaroid-chocolate-box",
    slug: "custom-polaroid-chocolate-box",
    name: "Personalised Photo Frame & Truffle Box",
    tagline: "Custom tabletop wooden frame & handcrafted truffles",
    description:
      "A sentimental keepsake: send us your favourite photo which we print in rich glossy tones into a mini wooden tabletop easel frame, placed next to 6 handcrafted Belgian truffles in a gold-foiled gift box.",
    price: 499,
    priceDisplay: "₹499",
    isPriceConfirmed: true,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    categoryId: "personalised-gifts",
    occasions: ["Birthdays", "Anniversaries", "Friendship", "Just Because"],
    includedItems: [
      "Custom Printed Photo in Wooden Mini Easel Frame",
      "Assorted Handcrafted Belgian Truffles (6 pcs)",
      "Wax-sealed Custom Letter Card",
      "Satin Ribbon Wrapped Gift Box",
    ],
    isFeatured: true,
    isAvailable: true,
    supportsPersonalMessage: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    advanceNotice: "Photo print processing requires 3 hours notice",
    sortOrder: 16,
  },
];

// ----------------------------------------------------
// 3. GIFT ADDONS
// ----------------------------------------------------
export const GIFT_ADDONS: GiftAddon[] = [
  {
    id: "custom-calligraphy-card",
    name: "Handwritten Calligraphy Note",
    description: "Your personalized note hand-scribed on textured deckled cardstock.",
    price: 49,
    isAvailable: true,
    category: "card",
  },
  {
    id: "extra-belgian-truffles",
    name: "Extra Belgian Truffles (2 pcs)",
    description: "Two additional dark ganache chocolate truffles.",
    price: 69,
    isAvailable: true,
    category: "chocolate",
  },
  {
    id: "sparkler-birthday-candle",
    name: "Gold Celebration Candle",
    description: "Elegant metallic gold celebration candle.",
    price: 29,
    isAvailable: true,
    category: "candle",
  },
  {
    id: "mini-baby-breath-posy",
    name: "Mini Baby's Breath Posy",
    description: "A delicate sprig of white baby's breath tucked into the ribbon.",
    price: 59,
    isAvailable: true,
    category: "flowers",
  },
];

export const DEFAULT_GIFTING_SETTINGS: GiftingSettings = {
  isEnabled: true,
  whatsappNumber: "918090205081",
  pickupEnabled: true,
  deliveryEnabled: true,
  deliveryArea: "CSJM University Campus, Kalyanpur & Kanpur (within 7 km)",
  deliveryFee: 49,
  advanceOrderNotice: "Same-day delivery available for orders placed before 7:00 PM.",
  greetingCardAvailable: true,
  sameDayCutoffTime: "7:00 PM",
};

export const INITIAL_GIFT_ORDERS: GiftingOrderRecord[] = [
  {
    id: "GIFT-781",
    customerName: "Pooja Verma",
    customerPhone: "+91 98765 11223",
    recipientName: "Aditi Sharma",
    giftItems: [
      {
        giftId: "the-classic-crush-combo",
        name: "The Classic Crush Signature Combo",
        price: 599,
        quantity: 1,
        addons: ["Handwritten Calligraphy Note"],
        personalMessage: "Happy Birthday dearest Aditi! Have the sweetest year ahead! Love, Pooja",
      },
    ],
    fulfilmentMethod: "Delivery",
    deliveryAddress: "Flat 402, Sunshine Heights, Swaroop Nagar, Kanpur",
    requestedDate: "Today",
    requestedTime: "5:00 PM - 7:00 PM",
    subtotal: 599,
    deliveryFee: 49,
    total: 648,
    status: "Preparing",
    createdAt: "1:20 PM",
    note: "Please ring bell and hand to recipient directly.",
  },
  {
    id: "GIFT-780",
    customerName: "Karan Malhotra",
    customerPhone: "+91 98222 33445",
    recipientName: "Meera",
    giftItems: [
      {
        giftId: "pastel-romance-bouquet",
        name: "Pastel Whisper Bouquet",
        price: 499,
        quantity: 1,
        personalMessage: "Happy Anniversary my love! Thank you for being my rock.",
      },
    ],
    fulfilmentMethod: "Pickup",
    requestedDate: "Today",
    requestedTime: "6:30 PM",
    subtotal: 499,
    deliveryFee: 0,
    total: 499,
    status: "Confirmed",
    createdAt: "11:45 AM",
  },
];

// ----------------------------------------------------
// BUILD YOUR OWN GIFT OPTIONS
// ----------------------------------------------------
export interface GiftBaseOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export const GIFT_BASE_OPTIONS: GiftBaseOption[] = [
  {
    id: "small-gift-box",
    name: "Small Gift Box",
    description: "Craft brown box with cream satin ribbon and shredded filler",
    price: 50,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "dessert-box",
    name: "Dessert Box",
    description: "Window treat box designed specifically for pastries & brownies",
    price: 60,
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "flower-bouquet-wrap",
    name: "Flower Bouquet Wrap",
    description: "Natural kraft florist wrap with rustic jute twine",
    price: 70,
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "chocolate-sleeve",
    name: "Chocolate Gift Sleeve",
    description: "Gold-foiled sleeve packaging with cafe wax seal stamp",
    price: 40,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "celebration-bundle",
    name: "Celebration Bundle Carrier",
    description: "Spacious rigid hamper tray holding treats, blooms and notes together",
    price: 100,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
  },
];

export interface GiftSweetOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const GIFT_SWEET_OPTIONS: GiftSweetOption[] = [
  {
    id: "dark-white-waffle",
    name: "Dark & White Delight",
    description: "Our iconic molten chocolate dessert",
    price: 59,
  },
  {
    id: "belgian-brownie",
    name: "Belgian Walnut Brownie",
    description: "Dense, fudgy and warm chocolate square",
    price: 69,
  },
  {
    id: "choco-lava-cup",
    name: "Choco Lava Cup",
    description: "Warm molten chocolate center cake",
    price: 79,
  },
  {
    id: "chocolate-pastry",
    name: "Chocolate Fantasy Pastry",
    description: "Moist sponge layered with chocolate fudge",
    price: 65,
  },
  {
    id: "artisan-truffles-4",
    name: "Handcrafted Truffles (Pack of 4)",
    description: "Assorted milk & dark chocolate ganache bites",
    price: 119,
  },
  {
    id: "cold-coffee-bottle",
    name: "Signature Cold Coffee (300ml bottle)",
    description: "Creamy iced cold brew in vintage glass bottle",
    price: 79,
  },
];

export interface GiftFlowerOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const GIFT_FLOWER_OPTIONS: GiftFlowerOption[] = [
  {
    id: "flowers-none",
    name: "No Flowers",
    description: "Sweet treats and personalized card only",
    price: 0,
  },
  {
    id: "flowers-mini-posy",
    name: "Mini Floral Posy",
    description: "Pastel blooms & baby's breath accent (4–5 stems)",
    price: 180,
  },
  {
    id: "flowers-classic-bouquet",
    name: "Classic Fresh Roses & Daisies",
    description: "Handpicked fresh roses and seasonal foliage (8–10 stems)",
    price: 290,
  },
  {
    id: "flowers-deluxe-bouquet",
    name: "Deluxe Celebration Bouquet",
    description: "Full florist arrangement with roses, carnations & greens",
    price: 450,
  },
];

export const MESSAGE_SUGGESTIONS = [
  "A little something to make you smile.",
  "You deserve all the good things.",
  "Happy Birthday! Hope your day is as lovely as you are.",
  "Just because you crossed my mind.",
  "Sending you something sweet.",
  "Thank you for being so wonderful.",
  "So proud of you! Huge congratulations.",
] as const;


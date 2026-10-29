export interface CafeConfig {
  name: string;
  tagline: string;
  subTagline: string;
  shortDescription: string;
  phone: string;
  phoneDisplay: string;
  whatsappNumber: string; // e.g. "918090205081" without '+' or spaces for wa.me link
  whatsappDisplay: string;
  instagramHandle: string;
  instagramUrl: string;
  address: {
    street: string;
    area: string;
    city: string;
    landmark?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  timings: {
    days: string;
    hours: string;
    kitchenCloses?: string;
  };
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
}

export const CAFE_CONFIG: CafeConfig = {
  name: "THE CLASSIC CRUSH",
  tagline: "BAKERY & CAFE",
  subTagline: "Freshly made. Comfortingly familiar.",
  shortDescription: "A cozy neighbourhood vegetarian bakery & cafe made for good bites, sweet cravings, and warm conversations with friends.",
  phone: "+918090205081",
  phoneDisplay: "+91 80902 05081",
  whatsappNumber: "918090205081", // Configurable WhatsApp number
  whatsappDisplay: "+91 80902 05081",
  instagramHandle: "@theclassiccrush.cafe",
  instagramUrl: "https://instagram.com",
  address: {
    street: "Near Natraj Point, CSJM University",
    area: "Kalyanpur",
    city: "Kanpur, Uttar Pradesh – 208024",
    landmark: "Near Natraj Point",
  },
  coordinates: {
    lat: 26.500720,
    lng: 80.268059,
  },
  timings: {
    days: "Monday – Sunday (Open All 7 Days)",
    hours: "10:30 AM – 10:30 PM",
    kitchenCloses: "Last order at 10:00 PM",
  },
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=26.500720,80.268059",
  // Standard clean embed map preview centered on the cafe at CSJMU
  googleMapsEmbedUrl: "https://maps.google.com/maps?q=26.500720,80.268059&hl=en&z=17&output=embed",
};

/**
 * Generate a prefilled WhatsApp link
 */
export function getWhatsAppLink(customMessage?: string): string {
  const text = customMessage || `Hi ${CAFE_CONFIG.name}! I'm viewing your website and would like to place an order / have a query.`;
  return `https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function getCallLink(): string {
  return `tel:${CAFE_CONFIG.phone}`;
}

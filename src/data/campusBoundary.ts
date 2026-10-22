/**
 * Authoritative Campus Boundary and Geospatial Utilities for CSJMU (Kanpur University)
 *
 * Geographical Data Source:
 * OpenStreetMap (OSM) Way ID: 506689489
 * Feature: Chhatrapati Shahu Ji Maharaj University, Kalyanpur, Kanpur, Uttar Pradesh, 208012, India
 * Amenity: University
 */

export interface CampusLandmark {
  id: string;
  name: string;
  category: "academic" | "admin" | "hostel" | "sports" | "amenity";
  lat: number;
  lng: number;
  description: string;
}

export interface CampusDeliveryLocation {
  lat: number;
  lng: number;
  building: string;
  room?: string;
  instructions?: string;
  formattedAddress: string;
  nearestLandmark?: string;
  isVerifiedCampus: boolean;
  confirmedAt?: string;
}

/**
 * Campus Center (approximate visual centroid inside the campus grounds)
 */
export const CSJMU_CAMPUS_CENTER = {
  lat: 26.50301,
  lng: 80.26784,
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 19,
};

/**
 * Campus Bounding Box (for map constraints and early rejection filtering)
 */
export const CSJMU_BOUNDING_BOX = {
  minLat: 26.4965,
  maxLat: 26.5096,
  minLng: 80.2610,
  maxLng: 80.2742,
};

/**
 * Authoritative 26-vertex polygon boundary representing Chhatrapati Shahu Ji Maharaj University
 * Coordinates format: [latitude, longitude]
 * Derived from OSM Way 506689489
 */
export const CSJMU_BOUNDARY_COORDINATES: [number, number][] = [
  [26.4999553, 80.2610547],
  [26.4995976, 80.2611056],
  [26.4993528, 80.2621007],
  [26.4982486, 80.2617145],
  [26.4975645, 80.2639997],
  [26.4967723, 80.2666685],
  [26.4965683, 80.2673283],
  [26.4971828, 80.2676636],
  [26.4970964, 80.2679747],
  [26.496926, 80.2679077],
  [26.4967531, 80.2683315],
  [26.4969476, 80.2684361],
  [26.4968625, 80.2687228],
  [26.4967797, 80.2690014],
  [26.4965919, 80.2696411],
  [26.5070579, 80.2739292],
  [26.5094728, 80.2673913],
  [26.5038463, 80.2632916],
  [26.5035256, 80.2631244],
  [26.5032702, 80.2629912],
  [26.5027534, 80.2638205],
  [26.5022709, 80.2632809],
  [26.5024332, 80.2630646],
  [26.5010139, 80.2618754],
  [26.5004666, 80.2621865],
  [26.4999553, 80.2610547],
];

/**
 * Key campus landmarks inside CSJMU for fast one-tap delivery destination selection
 */
export const CSJMU_LANDMARKS: CampusLandmark[] = [
  {
    id: "central-library",
    name: "Central Library & Reading Hall",
    category: "academic",
    lat: 26.5018,
    lng: 80.2662,
    description: "Main university library building and research center",
  },
  {
    id: "uiet-engineering",
    name: "University Institute of Engg & Tech (UIET)",
    category: "academic",
    lat: 26.5048,
    lng: 80.2692,
    description: "Engineering & Technology academic departments and labs",
  },
  {
    id: "admin-block",
    name: "Administrative Building (Central Secretariat)",
    category: "admin",
    lat: 26.5028,
    lng: 80.2675,
    description: "VC Office, Registrar, Student Welfare & Examination Wing",
  },
  {
    id: "auditorium",
    name: "Main Auditorium & Convention Centre",
    category: "admin",
    lat: 26.5008,
    lng: 80.2655,
    description: "Cultural auditorium, seminar hall and central lawn",
  },
  {
    id: "ibm-dept",
    name: "Institute of Business Management (IBM)",
    category: "academic",
    lat: 26.5038,
    lng: 80.2680,
    description: "MBA & BBA Management Department block",
  },
  {
    id: "cs-it-block",
    name: "Department of Computer Science & IT (MCA)",
    category: "academic",
    lat: 26.5042,
    lng: 80.2698,
    description: "Computer Application labs & IT classrooms",
  },
  {
    id: "boys-hostel",
    name: "Boys' Hostel Complex (Shivaji / Atal Blocks)",
    category: "hostel",
    lat: 26.5065,
    lng: 80.2675,
    description: "Residential hostels for male students & scholars",
  },
  {
    id: "girls-hostel",
    name: "Girls' Hostel Complex (Gargi / Saraswati)",
    category: "hostel",
    lat: 26.5055,
    lng: 80.2665,
    description: "Residential hostels for female students & scholars",
  },
  {
    id: "sports-complex",
    name: "Sports Complex & Athletic Stadium",
    category: "sports",
    lat: 26.5005,
    lng: 80.2685,
    description: "Outdoor sports stadium, running track & gymnasium",
  },
  {
    id: "health-center",
    name: "Health Centre & Medical Unit",
    category: "amenity",
    lat: 26.5020,
    lng: 80.2650,
    description: "University primary health & dispensary block",
  },
];

/**
 * Standard Ray-Casting algorithm for point-in-polygon containment check.
 * Accurately determines if a coordinate is strictly within the permitted polygon.
 */
export function isPointInCampusBoundary(
  lat: number,
  lng: number,
  polygon: [number, number][] = CSJMU_BOUNDARY_COORDINATES
): boolean {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    isNaN(lat) ||
    isNaN(lng) ||
    !isFinite(lat) ||
    !isFinite(lng)
  ) {
    return false;
  }

  // Quick bounding box check for rapid rejection
  if (
    lat < CSJMU_BOUNDING_BOX.minLat ||
    lat > CSJMU_BOUNDING_BOX.maxLat ||
    lng < CSJMU_BOUNDING_BOX.minLng ||
    lng > CSJMU_BOUNDING_BOX.maxLng
  ) {
    return false;
  }

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculate distance between two lat/lng pairs in meters using Haversine formula
 */
export function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Finds the nearest campus landmark to a given coordinate
 */
export function findNearestLandmark(
  lat: number,
  lng: number
): { landmark: CampusLandmark; distanceMeters: number } | null {
  if (!isFinite(lat) || !isFinite(lng)) return null;

  let nearest: CampusLandmark | null = null;
  let minDistance = Infinity;

  for (const lm of CSJMU_LANDMARKS) {
    const dist = getDistanceMeters(lat, lng, lm.lat, lm.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = lm;
    }
  }

  return nearest ? { landmark: nearest, distanceMeters: minDistance } : null;
}

/**
 * Validates a proposed delivery point and generates friendly status messaging.
 */
export function validateCampusDeliveryPoint(
  lat: number,
  lng: number
): {
  valid: boolean;
  message: string;
  nearestLandmark?: string;
  distanceToNearest?: number;
} {
  if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
    return {
      valid: false,
      message: "Please select a valid point on the map.",
    };
  }

  const inside = isPointInCampusBoundary(lat, lng);

  if (!inside) {
    return {
      valid: false,
      message: "Sorry! TCC currently delivers only within the CSJMU university campus.",
    };
  }

  const nearest = findNearestLandmark(lat, lng);

  return {
    valid: true,
    message: "Delivery available inside CSJMU campus.",
    nearestLandmark: nearest?.landmark.name,
    distanceToNearest: nearest?.distanceMeters,
  };
}

/**
 * Authoritative Backend Campus Boundary and Geospatial Validation for CSJMU
 *
 * Geographical Data Source: OpenStreetMap (OSM) Way ID: 506689489
 * Chhatrapati Shahu Ji Maharaj University, Kalyanpur, Kanpur
 */

export const CSJMU_BOUNDING_BOX = {
  minLat: 26.4965,
  maxLat: 26.5096,
  minLng: 80.2610,
  maxLng: 80.2742,
};

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

  // Rapid bounding box filtering
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

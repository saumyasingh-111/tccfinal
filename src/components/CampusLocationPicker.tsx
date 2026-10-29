import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CSJMU_CAMPUS_CENTER,
  CSJMU_BOUNDARY_COORDINATES,
  CSJMU_LANDMARKS,
  validateCampusDeliveryPoint,
  type CampusDeliveryLocation,
  type CampusLandmark,
} from "../data/campusBoundary";
import { CAFE_CONFIG } from "../data/cafeConfig";
import {
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
  Building2,
  DoorClosed,
  FileText,
  Edit3,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface CampusLocationPickerProps {
  initialLocation?: CampusDeliveryLocation | null;
  customerName?: string;
  customerPhone?: string;
  onLocationConfirmed: (location: CampusDeliveryLocation) => void;
  className?: string;
}

export const CampusLocationPicker: React.FC<CampusLocationPickerProps> = ({
  initialLocation,
  customerName = "",
  customerPhone = "",
  onLocationConfirmed,
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);

  // Map and selection states
  const [mapReady, setMapReady] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      return [initialLocation.lat, initialLocation.lng];
    }
    return [CSJMU_CAMPUS_CENTER.lat, CSJMU_CAMPUS_CENTER.lng];
  });

  const [validation, setValidation] = useState(() =>
    validateCampusDeliveryPoint(selectedCoords[0], selectedCoords[1])
  );

  // Address fields
  const [building, setBuilding] = useState<string>(
    initialLocation?.building || "Central Library & Reading Hall"
  );
  const [room, setRoom] = useState<string>(initialLocation?.room || "");
  const [instructions, setInstructions] = useState<string>(
    initialLocation?.instructions || ""
  );

  // Confirmation state
  const [isConfirmed, setIsConfirmed] = useState<boolean>(
    initialLocation?.isVerifiedCampus ?? false
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Create custom branded pin for Leaflet
  const createBrandedPinIcon = useCallback((isValid: boolean) => {
    const pinColor = isValid ? "#0F3A23" : "#DC2626";
    const ringColor = isValid ? "#C99742" : "#F87171";

    return L.divIcon({
      className: "tcc-custom-map-marker",
      html: `
        <div style="position: relative; width: 36px; height: 42px; transform: translate(-18px, -42px);">
          <div style="position: absolute; bottom: 0; left: 50%; width: 14px; height: 6px; margin-left: -7px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1.5px);"></div>
          <svg viewBox="0 0 36 42" fill="none" style="width: 36px; height: 42px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));">
            <path d="M18 0C8.05887 0 0 8.05887 0 18C0 28.5 18 42 18 42C18 42 36 28.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="${pinColor}"/>
            <circle cx="18" cy="18" r="9" fill="#FAF6F0"/>
            <circle cx="18" cy="18" r="4.5" fill="${ringColor}"/>
          </svg>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
    });
  }, []);

  // Update position, marker, and validation
  const updatePosition = useCallback(
    (lat: number, lng: number, autoFillBuilding = false) => {
      setSelectedCoords([lat, lng]);
      const res = validateCampusDeliveryPoint(lat, lng);
      setValidation(res);
      setIsConfirmed(false); // require re-confirmation on change
      setGpsError(null);

      if (autoFillBuilding && res.nearestLandmark) {
        setBuilding(res.nearestLandmark);
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setIcon(createBrandedPinIcon(res.valid));
      }
    },
    [createBrandedPinIcon]
  );

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [selectedCoords[0], selectedCoords[1]],
      zoom: CSJMU_CAMPUS_CENTER.defaultZoom,
      minZoom: CSJMU_CAMPUS_CENTER.minZoom,
      maxZoom: CSJMU_CAMPUS_CENTER.maxZoom,
      scrollWheelZoom: "center",
      zoomControl: true,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer following OSM Tile Usage Policy
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Permitted CSJMU Campus Boundary Polygon overlay
    const campusPolygon = L.polygon(CSJMU_BOUNDARY_COORDINATES, {
      color: "#0F3A23",
      weight: 2.5,
      dashArray: "6, 6",
      fillColor: "#0F3A23",
      fillOpacity: 0.12,
    }).addTo(map);

    polygonLayerRef.current = campusPolygon;

    // Permanent Cafe Marker at Natraj Point, CSJM University
    const cafeCoords: [number, number] = [
      CAFE_CONFIG.coordinates?.lat || 26.500720,
      CAFE_CONFIG.coordinates?.lng || 80.268059,
    ];

    const cafePinIcon = L.divIcon({
      className: "tcc-cafe-map-marker",
      html: `
        <div style="position: relative; width: 34px; height: 34px; transform: translate(-17px, -17px); background: #0F3A23; border: 2.5px solid #C99742; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.35); font-size: 15px; cursor: pointer;">
          ☕
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const cafeMarker = L.marker(cafeCoords, {
      icon: cafePinIcon,
      title: "The Classic Crush Cafe — Near Natraj Point",
      zIndexOffset: 1000,
    }).addTo(map);

    cafeMarker.bindTooltip(
      "<div style='text-align: center; font-family: serif; font-weight: bold; color: #0F3A23; font-size: 12px;'>The Classic Crush Cafe<div style='font-family: sans-serif; font-size: 10px; font-weight: normal; color: #6E776F;'>Near Natraj Point, CSJM University</div></div>",
      {
        permanent: false,
        direction: "top",
        offset: [0, -18],
      }
    );

    cafeMarker.on("click", () => {
      updatePosition(cafeCoords[0], cafeCoords[1], true);
      setBuilding("The Classic Crush Cafe (Near Natraj Point)");
    });

    // Draggable delivery marker
    const marker = L.marker([selectedCoords[0], selectedCoords[1]], {
      icon: createBrandedPinIcon(validation.valid),
      draggable: true,
      title: "Drag to pin your CSJMU delivery point",
    }).addTo(map);

    markerRef.current = marker;

    // Map click listener: move marker to clicked location
    map.on("click", (e: L.LeafletMouseEvent) => {
      updatePosition(e.latlng.lat, e.latlng.lng, true);
    });

    // Marker drag end listener
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      updatePosition(pos.lat, pos.lng, true);
    });

    // Fit bounds or ensure visible on mount
    setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // mount only once

  // Handle Landmark quick-select click
  const handleSelectLandmark = (lm: CampusLandmark) => {
    setBuilding(lm.name);
    updatePosition(lm.lat, lm.lng, false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lm.lat, lm.lng], 17, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  // GPS Locate Me button
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        updatePosition(latitude, longitude, true);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, {
            animate: true,
            duration: 1,
          });
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Could not obtain GPS location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location access denied. Please click on the map to set your location.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "GPS position unavailable. Please click your building on the map.";
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Confirm Delivery Location
  const handleConfirm = () => {
    if (!validation.valid) return;
    if (!building.trim()) return;

    const formatted = `${building.trim()}${
      room.trim() ? `, ${room.trim()}` : ""
    }, CSJMU Campus, Kalyanpur, Kanpur`;

    const locationData: CampusDeliveryLocation = {
      lat: Number(selectedCoords[0].toFixed(6)),
      lng: Number(selectedCoords[1].toFixed(6)),
      building: building.trim(),
      room: room.trim() || undefined,
      instructions: instructions.trim() || undefined,
      formattedAddress: formatted,
      nearestLandmark: validation.nearestLandmark,
      isVerifiedCampus: true,
      confirmedAt: new Date().toISOString(),
    };

    setIsConfirmed(true);
    onLocationConfirmed(locationData);
  };

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border border-[#E2D9CC] shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* 1. Header Section */}
      <div className="p-5 sm:p-6 border-b border-[#FAF6F0] bg-[#FAF6F0]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F3A23]" />
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.24em] uppercase text-[#0F3A23]">
                Campus Delivery Only
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F3A23] mt-0.5">
              Choose Your Delivery Location
            </h3>
            <p className="text-xs text-[#6E776F] font-light mt-0.5">
              Currently delivering within CSJMU campus only.
              {customerName ? ` Order for ${customerName}${customerPhone ? ` (${customerPhone})` : ""}.` : ""}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 bg-[#E6F0EB] text-[#0F3A23] rounded-full text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kalyanpur, Kanpur</span>
          </div>
        </div>
      </div>

      {/* Confirmed Summary View (when confirmed) */}
      {isConfirmed ? (
        <div className="p-6 space-y-4 animate-hero-fade">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#E6F0EB] border border-[#0F3A23]/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0F3A23] text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-[#C99742]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F3A23] uppercase tracking-wider">
                    Verified CSJMU Campus Location
                  </span>
                  <span className="text-[10px] bg-white text-[#0F3A23] px-2 py-0.5 rounded-full font-semibold border border-[#0F3A23]/15">
                    Ready
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base sm:text-lg text-[#0F3A23]">
                  {building}
                </h4>
                {room && (
                  <p className="text-xs text-[#162820] font-medium">
                    Room / Details: {room}
                  </p>
                )}
                {instructions && (
                  <p className="text-xs text-[#6E776F] italic">
                    Instructions: &ldquo;{instructions}&rdquo;
                  </p>
                )}
                <div className="pt-1 flex items-center gap-2 text-[11px] text-[#6E776F] font-mono">
                  <span>
                    Lat: {selectedCoords[0].toFixed(5)}, Lng:{" "}
                    {selectedCoords[1].toFixed(5)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmed(false)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF6F0] text-[#0F3A23] border border-[#0F3A23] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 space-y-5">
          {/* 2. Interactive Map Container */}
          <div className="relative">
            <div
              ref={mapContainerRef}
              className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#E2D9CC] shadow-xs relative bg-[#EFE9DE] z-10"
              style={{ minHeight: "280px" }}
            />

            {!mapReady && (
              <div className="absolute inset-0 bg-[#FAF6F0]/80 backdrop-blur-xs flex items-center justify-center rounded-2xl z-20">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F3A23]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C99742]" />
                  <span>Loading CSJMU Campus Map...</span>
                </div>
              </div>
            )}

            {/* GPS "Locate Me" Floating Action Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="absolute top-3 right-3 z-20 bg-white/95 hover:bg-white text-[#0F3A23] border border-[#E2D9CC] shadow-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer backdrop-blur-xs"
              title="Locate my position on campus"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C99742]" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5 text-[#0F3A23]" />
              )}
              <span>{isLocating ? "Locating..." : "Locate Me"}</span>
            </button>

            {/* Subtle boundary indicator banner */}
            <div className="absolute bottom-3 left-3 z-20 bg-black/65 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white flex items-center gap-1.5 shadow-sm pointer-events-none">
              <span className="w-2 h-2 rounded-full border border-white bg-[#0F3A23]" />
              <span>Green outline indicates permitted CSJMU campus</span>
            </div>
          </div>

          {/* GPS error banner if any */}
          {gpsError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* 3. Validation Status Banner */}
          {validation.valid ? (
            <div className="p-3.5 rounded-xl bg-[#E6F0EB] border border-[#0F3A23]/25 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0F3A23] shrink-0" />
                <div>
                  <span className="font-bold text-[#0F3A23] block">
                    Inside CSJMU Campus
                  </span>
                  <span className="text-[11px] text-[#2F3E37]">
                    {validation.nearestLandmark
                      ? `Near: ${validation.nearestLandmark}`
                      : "Location verified for campus delivery"}
                  </span>
                </div>
              </div>

              <span className="font-mono text-[10px] text-[#6E776F] hidden sm:inline-block">
                {selectedCoords[0].toFixed(5)}, {selectedCoords[1].toFixed(5)}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  Sorry! TCC currently delivers only within the CSJMU university
                  campus.
                </span>
                <span className="text-[11px] text-rose-700">
                  Please tap inside the highlighted green campus boundary on the
                  map, or pick a building below.
                </span>
              </div>
            </div>
          )}

          {/* 4. Quick Landmark Selection Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#162820] flex items-center justify-between">
              <span>Quick Landmark Pick</span>
              <span className="text-[10px] text-[#6E776F] font-light">
                Tap to jump marker
              </span>
            </label>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {CSJMU_LANDMARKS.slice(0, 6).map((lm) => {
                const isSelected = building === lm.name;
                return (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => handleSelectLandmark(lm)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-[#0F3A23] text-white border-[#0F3A23] shadow-xs"
                        : "bg-[#FAF6F0] text-[#162820] border-[#E2D9CC] hover:bg-[#E8DFD1]"
                    }`}
                  >
                    {lm.name.split("(")[0].trim()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Address Input Form Fields */}
          <div className="space-y-3.5 pt-2 border-t border-[#FAF6F0]">
            {/* Building / Hostel */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                Building / Hostel / Department *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Library, Shivaji Hostel, UIET Block 2"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] bg-white"
                />
                <Building2 className="w-4 h-4 text-[#6E776F] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Room / Floor */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                Room No. / Floor / Lab / Desk (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Room 204, 2nd Floor / Lab 3 / Lawn Bench"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] bg-white"
                />
                <DoorClosed className="w-4 h-4 text-[#6E776F] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                Delivery Instructions (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Call upon reaching the gate, leave with security"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] bg-white"
                />
                <FileText className="w-4 h-4 text-[#6E776F] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* 6. Confirmation Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!validation.valid || !building.trim()}
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-full bg-[#0F3A23] hover:bg-[#154D30] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C99742]" />
              <span>Confirm CSJMU Delivery Location</span>
            </button>

            {!validation.valid && (
              <p className="text-[11px] text-rose-600 text-center mt-2">
                Location must be inside the CSJMU boundary to confirm delivery.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

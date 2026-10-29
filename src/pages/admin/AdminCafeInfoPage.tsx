import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { Save, Phone, MapPin, Clock } from "lucide-react";

export const AdminCafeInfoPage: React.FC = () => {
  const { cafeInfo, updateCafeInfo } = useData();
  const { showToast } = useToast();

  const [name, setName] = useState(cafeInfo.name);
  const [tagline, setTagline] = useState(cafeInfo.tagline);
  const [phone, setPhone] = useState(cafeInfo.phone);
  const [phoneDisplay, setPhoneDisplay] = useState(cafeInfo.phoneDisplay);
  const [whatsappNumber, setWhatsappNumber] = useState(cafeInfo.whatsappNumber);
  const [whatsappDisplay, setWhatsappDisplay] = useState(cafeInfo.whatsappDisplay);
  const [instagramHandle, setInstagramHandle] = useState(cafeInfo.instagramHandle);
  const [instagramUrl, setInstagramUrl] = useState(cafeInfo.instagramUrl);

  const [street, setStreet] = useState(cafeInfo.address.street);
  const [area, setArea] = useState(cafeInfo.address.area);
  const [city, setCity] = useState(cafeInfo.address.city);
  const [landmark, setLandmark] = useState(cafeInfo.address.landmark || "");

  const [days, setDays] = useState(cafeInfo.timings.days);
  const [hours, setHours] = useState(cafeInfo.timings.hours);
  const [kitchenCloses, setKitchenCloses] = useState(cafeInfo.timings.kitchenCloses || "");

  const [mapsUrl, setMapsUrl] = useState(cafeInfo.googleMapsUrl);
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState(cafeInfo.googleMapsEmbedUrl);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCafeInfo({
      name: name.trim(),
      tagline: tagline.trim(),
      phone: phone.trim(),
      phoneDisplay: phoneDisplay.trim(),
      whatsappNumber: whatsappNumber.trim().replace(/[^0-9]/g, ""),
      whatsappDisplay: whatsappDisplay.trim(),
      instagramHandle: instagramHandle.trim(),
      instagramUrl: instagramUrl.trim(),
      address: {
        street: street.trim(),
        area: area.trim(),
        city: city.trim(),
        landmark: landmark.trim() || undefined,
      },
      timings: {
        days: days.trim(),
        hours: hours.trim(),
        kitchenCloses: kitchenCloses.trim() || undefined,
      },
      googleMapsUrl: mapsUrl.trim(),
      googleMapsEmbedUrl: mapsEmbedUrl.trim(),
      coordinates: cafeInfo.coordinates || {
        lat: 26.500720,
        lng: 80.268059,
      },
    });
    showToast("Cafe details updated! All customer buttons and pages are synced.");
  };

  return (
    <AdminLayout
      pageTitle="Cafe Information"
      pageSubtitle="Central business configuration. Updates instantly propagate to header, footer, Visit Us, and WhatsApp buttons."
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Basic Brand */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#1C241E] border-b border-[#EFE9DE] pb-2">
            Brand Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Cafe Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-sm font-serif font-bold text-[#1C241E] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Sub-Tagline
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs font-semibold text-[#755546] focus:outline-none focus:ring-1 focus:ring-[#26332A]"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers & WhatsApp */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#1C241E] border-b border-[#EFE9DE] pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#755546]" />
            <span>Contact Numbers &amp; WhatsApp</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Phone Number (for direct calling link)
              </label>
              <input
                type="text"
                required
                placeholder="+918090205081"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Phone Number Display Label
              </label>
              <input
                type="text"
                required
                placeholder="+91 80902 05081"
                value={phoneDisplay}
                onChange={(e) => setPhoneDisplay(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                WhatsApp Number (without + or spaces, e.g. 918090205081)
              </label>
              <input
                type="text"
                required
                placeholder="918090205081"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                WhatsApp Display Label
              </label>
              <input
                type="text"
                required
                placeholder="+91 80902 05081"
                value={whatsappDisplay}
                onChange={(e) => setWhatsappDisplay(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                placeholder="@theclassiccrush.cafe"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Instagram Profile Link
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/theclassiccrush.cafe"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#1C241E] border-b border-[#EFE9DE] pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#755546]" />
            <span>Physical Location &amp; Directions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Street Address / Shop Details
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Area / Neighbourhood
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                City &amp; Pincode
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Landmark Note
              </label>
              <input
                type="text"
                placeholder="Near Natraj Point"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Google Maps External Link (Opens on &lsquo;Get Directions&rsquo;)
              </label>
              <input
                type="text"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Google Maps Embed URL (Iframe Preview URL)
              </label>
              <input
                type="text"
                value={mapsEmbedUrl}
                onChange={(e) => setMapsEmbedUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>
          </div>
        </div>

        {/* Timings */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#1C241E] border-b border-[#EFE9DE] pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#755546]" />
            <span>Opening Hours</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Days Open
              </label>
              <input
                type="text"
                required
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Daily Hours
              </label>
              <input
                type="text"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Last Kitchen Order
              </label>
              <input
                type="text"
                value={kitchenCloses}
                onChange={(e) => setKitchenCloses(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E5DFD5] shadow-lg flex items-center justify-between">
          <p className="text-xs text-[#767E7A] font-light">
            Saves phone, WhatsApp number, and address across the whole customer site.
          </p>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#26332A] hover:bg-[#1C241E] text-[#FAF7F2] text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Cafe Information</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useOrder } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import { MESSAGE_SUGGESTIONS } from "../data/giftingData";
import {
  ArrowLeft,
  Gift,
  Check,
  MessageCircle,
  ShoppingBag,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";

export const GiftDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { giftProducts, giftAddons, giftingSettings, cafeInfo } = useData();
  const { addGiftToOrder } = useOrder();
  const { showToast } = useToast();

  const product = useMemo(() => {
    return giftProducts.find((p) => p.slug === slug || p.id === slug);
  }, [giftProducts, slug]);

  // Gallery image selector
  const [selectedImage, setSelectedImage] = useState<string>(product?.image || "");

  // Update selected image when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
    }
  }, [product]);

  // Addons selected (addon id -> boolean)
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  // Personal message state
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");

  // Calculate addons price
  const addonsTotal = useMemo(() => {
    return Object.entries(selectedAddons).reduce((sum, [addonId, isSelected]) => {
      if (!isSelected) return sum;
      const addon = giftAddons.find((a) => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);
  }, [selectedAddons, giftAddons]);

  const activeAddonNames = useMemo(() => {
    return Object.entries(selectedAddons)
      .filter(([, isSelected]) => isSelected)
      .map(([addonId]) => {
        const addon = giftAddons.find((a) => a.id === addonId);
        return addon ? addon.name : "";
      })
      .filter(Boolean);
  }, [selectedAddons, giftAddons]);

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#F5EFEB] flex flex-col items-center justify-center p-6 text-center">
        <Gift className="w-12 h-12 text-[#E2D9CC] mb-3 stroke-1" />
        <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
          Gift Bundle Not Found
        </h2>
        <p className="text-xs text-[#6E776F] max-w-sm mt-1 mb-6">
          The gift you are looking for might have been updated or moved.
        </p>
        <Link
          to="/gifting"
          className="px-6 py-2.5 bg-[#0F3A23] hover:bg-[#154D30] text-white rounded-full text-xs font-semibold uppercase tracking-wider"
        >
          Explore All Gifts
        </Link>
      </div>
    );
  }

  const totalPrice = (product.isPriceConfirmed ? product.price : 0) + addonsTotal;

  // Toggle addon
  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };

  // Add to order bag
  const handleAddToBag = () => {
    if (!product.isAvailable) return;

    addGiftToOrder({
      id: product.id,
      name: product.name,
      price: totalPrice,
      image: product.image,
      description: product.description,
      giftNote: personalMessage || undefined,
      giftAddons: activeAddonNames.length > 0 ? activeAddonNames : undefined,
      recipientName: recipientName || undefined,
      isCustomGift: false,
    });
    showToast(`"${product.name}" added to your gift bag.`);
  };

  // WhatsApp order link
  const handleWhatsAppOrder = () => {
    const lines: string[] = [
      `Hi ${cafeInfo.name}! 👋`,
      `I would like to order the *"${product.name}"* gift bundle from your website:`,
      "",
      `🎁 *Gift:* ${product.name}`,
      `💰 *Base Price:* ${product.priceDisplay || `₹${product.price}`}`,
    ];

    if (activeAddonNames.length > 0) {
      lines.push(`✨ *Selected Add-ons:* ${activeAddonNames.join(", ")}`);
      lines.push(`➕ *Add-ons Total:* +₹${addonsTotal}`);
    }

    if (product.isPriceConfirmed) {
      lines.push(`*Estimated Total:* ₹${totalPrice}`);
    }

    if (recipientName) {
      lines.push(`*Recipient:* ${recipientName}`);
    }

    if (personalMessage) {
      lines.push(`💌 *Personal Card Message:* "${personalMessage}"`);
      if (senderName) lines.push(`   *From:* ${senderName}`);
    }

    lines.push("");
    lines.push("Order Details:");
    lines.push("My Name: ");
    lines.push("My Phone: ");
    lines.push("Fulfilment: Pickup / Delivery");
    lines.push("Requested Date & Time: ");
    lines.push("Delivery Address (if applicable): ");
    lines.push("");
    lines.push("*(Please confirm availability and booking)*");

    const waNumber = giftingSettings.whatsappNumber || cafeInfo.whatsappNumber;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
  };

  // Related gifts
  const relatedGifts = giftProducts
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 3);

  const allImages = [product.image, ...(product.additionalImages || [])];

  return (
    <div className="bg-[#F5EFEB] min-h-screen text-[#162820]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/gifting"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F3A23] hover:underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Gifts</span>
          </Link>

          <span className="text-xs text-[#6E776F] font-light">
            Gifting / {product.name}
          </span>
        </div>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-white border border-[#E2D9CC] shadow-xs">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {product.occasions[0] && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/95 backdrop-blur-xs text-[#0F3A23] border border-[#E2D9CC]">
                    {product.occasions[0]}
                  </span>
                )}
                {!product.isAvailable && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-rose-900 text-white">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail switcher if multiple images exist */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === img
                        ? "border-[#0F3A23] ring-2 ring-[#0F3A23]/20"
                        : "border-[#E2D9CC] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Fulfilment & Guarantee Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2D9CC] space-y-3 text-xs text-[#162820]">
              <div className="flex items-center gap-2 text-[#0F3A23] font-serif font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-[#0F3A23]" />
                <span>The Classic Crush Freshness Promise</span>
              </div>
              <p className="font-light leading-relaxed text-[#6E776F]">
                All bakes and pastries are prepared fresh in our bakery kitchen. Fresh floral arrangements are tied right before your scheduled pickup or dispatch.
              </p>
              <div className="pt-2 border-t border-[#FAF6F0] flex flex-wrap gap-4 text-[11px] text-[#0F3A23]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0F3A23]" />
                  <span>Cafe Pickup Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0F3A23]" />
                  <span>{product.advanceNotice || "Notice: 3–4 hrs"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Configurator */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0F3A23]">
                Curated Gift Bundle
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F3A23] mt-1">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="font-serif italic text-base text-[#6E776F] mt-1">
                  {product.tagline}
                </p>
              )}
            </div>

            {/* Price Badge */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-[#0F3A23]">
                {product.isPriceConfirmed ? (
                  `₹${totalPrice}`
                ) : (
                  <span className="text-lg text-[#6E776F] font-sans">
                    Price on confirmation
                  </span>
                )}
              </span>
              {addonsTotal > 0 && (
                <span className="text-xs text-[#6E776F]">
                  (Includes ₹{addonsTotal} add-ons)
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#6E776F] font-light leading-relaxed">
              {product.description}
            </p>

            {/* What's Inside */}
            {product.includedItems && product.includedItems.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2D9CC] space-y-2">
                <h3 className="font-serif font-bold text-sm text-[#0F3A23] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C99742]" />
                  <span>What&rsquo;s Inside This Bundle</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-[#6E776F] font-light pl-2">
                  {product.includedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F3A23] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Configurable Add-ons */}
            {giftAddons.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#0F3A23] flex items-center justify-between">
                  <span>Available Add-ons (Optional)</span>
                  <span className="text-xs font-normal text-[#6E776F]">
                    Select to enhance
                  </span>
                </h3>

                <div className="space-y-2">
                  {giftAddons.map((addon) => {
                    const isChecked = !!selectedAddons[addon.id];
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? "border-[#0F3A23] bg-[#FAF6F0] ring-1 ring-[#0F3A23]/20"
                            : "border-[#E2D9CC] bg-white hover:border-[#0F3A23]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? "border-[#0F3A23] bg-[#0F3A23] text-white"
                                : "border-[#E2D9CC]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-2" />}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#0F3A23] block">
                              {addon.name}
                            </span>
                            <span className="text-[10px] text-[#6E776F] font-light">
                              {addon.description}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold font-serif text-[#0F3A23] shrink-0">
                          +₹{addon.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Personal Message Card Input */}
            {product.supportsPersonalMessage && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2D9CC] space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#0F3A23] flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#0F3A23]" />
                  <span>Complimentary Greeting Card Message</span>
                </h3>
                <p className="text-[11px] text-[#6E776F] font-light">
                  We handwrite your note on textured cream paper and tuck it into the gift box.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Ananya"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                      From (Your Name)
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Rahul"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={2}
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Write a sweet message (or choose a quick idea below)..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs font-serif text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {MESSAGE_SUGGESTIONS.slice(0, 3).map((msg: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setPersonalMessage(msg)}
                      className="text-[10px] text-[#6E776F] bg-[#FAF6F0] hover:bg-[#E2D9CC] border border-[#E2D9CC] px-2 py-0.5 rounded-full cursor-pointer"
                    >
                      &ldquo;{msg}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWhatsAppOrder}
                className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Order on WhatsApp</span>
              </button>

              <button
                onClick={handleAddToBag}
                disabled={!product.isAvailable}
                className="py-3.5 px-6 bg-[#0F3A23] hover:bg-[#154D30] disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-[#C99742]" />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Gifts */}
        {relatedGifts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E2D9CC]">
            <h2 className="font-serif text-2xl font-bold text-[#0F3A23] mb-6">
              You might also love
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedGifts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/gifting/${rel.slug}`}
                  className="group bg-white rounded-2xl border border-[#E2D9CC] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="aspect-4/3 overflow-hidden bg-[#FAF6F0]">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#0F3A23] group-hover:text-[#154D30] transition-colors">
                        {rel.name}
                      </h4>
                      <p className="text-xs text-[#6E776F] line-clamp-1 mt-1 font-light">
                        {rel.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#FAF6F0] flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-[#0F3A23]">
                        {rel.priceDisplay || `₹${rel.price}`}
                      </span>
                      <span className="text-[10px] font-semibold text-[#0F3A23]">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Celebration Callout Banner */}
      <CakesCelebrationBanner />
    </div>
  );
};

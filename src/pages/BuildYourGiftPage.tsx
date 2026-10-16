import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useOrder } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import {
  GIFT_BASE_OPTIONS,
  GIFT_SWEET_OPTIONS,
  GIFT_FLOWER_OPTIONS,
  MESSAGE_SUGGESTIONS,
  type GiftBaseOption,
  type GiftFlowerOption,
} from "../data/giftingData";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Minus,
  MessageCircle,
  ShoppingBag,
  Gift,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";

export const BuildYourGiftPage: React.FC = () => {
  const { giftingSettings, cafeInfo, addGiftingOrder } = useData();
  const { addGiftToOrder } = useOrder();
  const { showToast } = useToast();

  // Active step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Base Selection
  const [selectedBase, setSelectedBase] = useState<GiftBaseOption>(GIFT_BASE_OPTIONS[0]);

  // Step 2: Sweets Selection (ID -> quantity)
  const [selectedSweets, setSelectedSweets] = useState<Record<string, number>>({
    "dark-white-waffle": 1,
    "belgian-brownie": 1,
  });

  // Step 3: Flowers Selection
  const [selectedFlowers, setSelectedFlowers] = useState<GiftFlowerOption>(
    GIFT_FLOWER_OPTIONS[1]
  );

  // Step 4: Personal Message & Card
  const [cardType, setCardType] = useState<"handwritten" | "printed" | "none">("handwritten");
  const [personalMessage, setPersonalMessage] = useState<string>(
    "A little something to make you smile."
  );
  const [senderName, setSenderName] = useState<string>("");

  // Step 5: Fulfilment Details
  const [recipientName, setRecipientName] = useState<string>("");
  const [fulfilmentMethod, setFulfilmentMethod] = useState<"Pickup" | "Delivery">("Pickup");
  const [requestedDate, setRequestedDate] = useState<string>("Today");
  const [requestedTime, setRequestedTime] = useState<string>("5:30 PM");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [specialNote, setSpecialNote] = useState<string>("");

  // Calculate pricing breakdown
  const cardPrice = cardType === "handwritten" ? 49 : cardType === "printed" ? 29 : 0;

  const sweetsPrice = useMemo(() => {
    return Object.entries(selectedSweets).reduce((total, [sweetId, qty]) => {
      const sweet = GIFT_SWEET_OPTIONS.find((s: any) => s.id === sweetId);
      return total + (sweet ? sweet.price * qty : 0);
    }, 0);
  }, [selectedSweets]);

  const sweetsCount = useMemo(() => {
    return Object.values(selectedSweets).reduce((sum, q) => sum + q, 0);
  }, [selectedSweets]);

  const deliveryFee =
    fulfilmentMethod === "Delivery" && giftingSettings.deliveryEnabled
      ? giftingSettings.deliveryFee || 49
      : 0;

  const subtotal = selectedBase.price + sweetsPrice + selectedFlowers.price + cardPrice;
  const total = subtotal + deliveryFee;

  // Sweets toggle / qty handlers
  const handleSweetQtyChange = (sweetId: string, delta: number) => {
    setSelectedSweets((prev) => {
      const current = prev[sweetId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[sweetId];
        return copy;
      }
      return { ...prev, [sweetId]: next };
    });
  };

  // Compile summary string for display
  const getGiftSummaryString = () => {
    const sweetsList = Object.entries(selectedSweets)
      .map(([id, qty]) => {
        const sweet = GIFT_SWEET_OPTIONS.find((s: any) => s.id === id);
        return sweet ? `${qty}x ${sweet.name}` : "";
      })
      .filter(Boolean)
      .join(", ");

    const parts = [
      selectedBase.name,
      sweetsList ? `Sweets: ${sweetsList}` : "",
      selectedFlowers.price > 0 ? selectedFlowers.name : "",
      cardType === "handwritten"
        ? "Handwritten Card"
        : cardType === "printed"
        ? "Printed Wish Card"
        : "",
    ].filter(Boolean);

    return parts.join(" + ");
  };

  // Continue to WhatsApp action
  const handleContinueOnWhatsApp = () => {
    if (!customerPhone && fulfilmentMethod === "Delivery") {
      showToast("Please enter your contact phone number.", "error");
      setCurrentStep(5);
      return;
    }

    // Save order record locally for admin reference
    try {
      addGiftingOrder({
        customerName: senderName || "Customer (Web)",
        customerPhone: customerPhone || "Not provided",
        recipientName: recipientName || undefined,
        giftItems: [
          {
            name: `Custom Gift (${selectedBase.name})`,
            price: subtotal,
            quantity: 1,
            isCustom: true,
            customSummary: getGiftSummaryString(),
            personalMessage: personalMessage || undefined,
            addons: [
              selectedFlowers.price > 0 ? selectedFlowers.name : "",
              cardType !== "none" ? `${cardType} card` : "",
            ].filter(Boolean),
          },
        ],
        fulfilmentMethod,
        deliveryAddress: fulfilmentMethod === "Delivery" ? deliveryAddress : undefined,
        requestedDate,
        requestedTime,
        subtotal,
        deliveryFee,
        total,
        status: "Pending Confirmation",
        note: specialNote || undefined,
      });
    } catch {}

    const lines: string[] = [
      `Hi ${cafeInfo.name}! 👋`,
      `I would like to place a custom *Build Your Own Gift* order from your website:`,
      "",
      `🎁 *Base Packaging:* ${selectedBase.name} (₹${selectedBase.price})`,
      `🍰 *Sweet Treats:*`,
    ];

    Object.entries(selectedSweets).forEach(([id, qty]) => {
      const sweet = GIFT_SWEET_OPTIONS.find((s: any) => s.id === id);
      if (sweet) {
        lines.push(`   • ${qty}x ${sweet.name} — ₹${sweet.price * qty}`);
      }
    });

    lines.push(`🌸 *Flowers:* ${selectedFlowers.name} (₹${selectedFlowers.price})`);

    if (cardType !== "none") {
      lines.push(
        `💌 *Greeting Card (${cardType === "handwritten" ? "Handwritten" : "Printed"}):* ₹${cardPrice}`
      );
      if (personalMessage) {
        lines.push(`   *Message:* "${personalMessage}"`);
      }
      if (senderName) {
        lines.push(`   *From:* ${senderName}`);
      }
    }

    lines.push("");
    lines.push(`*Estimated Subtotal:* ₹${subtotal}`);
    if (fulfilmentMethod === "Delivery") {
      lines.push(`*Delivery Charge:* ₹${deliveryFee}`);
      lines.push(`*Estimated Total:* ₹${total}`);
    } else {
      lines.push(`*Estimated Total:* ₹${subtotal}`);
    }

    lines.push("");
    lines.push(`*Fulfilment:* ${fulfilmentMethod}`);
    lines.push(`*Requested Date & Time:* ${requestedDate} at ${requestedTime}`);
    if (recipientName) lines.push(`*Recipient:* ${recipientName}`);
    if (customerPhone) lines.push(`*My Phone:* ${customerPhone}`);
    if (fulfilmentMethod === "Delivery" && deliveryAddress) {
      lines.push(`*Delivery Address:* ${deliveryAddress}`);
    }
    if (specialNote) lines.push(`*Notes:* ${specialNote}`);

    lines.push("");
    lines.push("*(Please confirm availability and final order details with me)*");

    const waNumber = giftingSettings.whatsappNumber || cafeInfo.whatsappNumber;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
  };

  // Add to order bag
  const handleSaveToBag = () => {
    addGiftToOrder({
      id: `custom-gift-${selectedBase.id}`,
      name: `Custom ${selectedBase.name} Bundle`,
      price: subtotal,
      image: selectedBase.image,
      description: getGiftSummaryString(),
      giftNote: personalMessage,
      giftAddons: [
        selectedFlowers.price > 0 ? selectedFlowers.name : "",
        cardType !== "none" ? `${cardType} card` : "",
      ].filter(Boolean),
      recipientName: recipientName || undefined,
      isCustomGift: true,
      customSummary: getGiftSummaryString(),
    });
    showToast("Custom gift added to your order bag!");
  };

  return (
    <div className="bg-[#F5EFEB] min-h-screen text-[#162820]">
      {/* Top Header */}
      <div className="bg-[#0F3A23] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#154D30]">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/gifting"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C99742] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Gifting Home</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#C99742] font-semibold block mb-1">
                Interactive Gifting Studio
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
                Build Your Own Gift
              </h1>
              <p className="text-xs sm:text-sm text-white/80 font-light mt-2 max-w-xl">
                Choose a box, handpick bakery favourites, add wild blooms and pen a sweet personal card. We craft and pack it fresh.
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <button
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    currentStep === step
                      ? "bg-[#C99742] text-[#0F3A23] ring-2 ring-white/30"
                      : currentStep > step
                      ? "bg-[#154D30] text-[#C99742] border border-[#C99742]/50"
                      : "bg-white/10 text-white/50"
                  }`}
                  title={`Step ${step}`}
                >
                  {currentStep > step ? <Check className="w-3.5 h-3.5" /> : step}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Interactive Steps Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* ---------------- STEP 1: CHOOSE A BASE ---------------- */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2D9CC] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F3A23]">
                      Step 1 of 5
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
                      Choose your gift base
                    </h2>
                  </div>
                  <span className="text-xs text-[#6E776F] font-light">
                    Packaging &amp; Presentation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GIFT_BASE_OPTIONS.map((base: any) => {
                    const isSelected = selectedBase.id === base.id;
                    return (
                      <div
                        key={base.id}
                        onClick={() => setSelectedBase(base)}
                        className={`group relative rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-[#0F3A23] ring-2 ring-[#0F3A23]/20 bg-[#FAF6F0]"
                            : "border-[#E2D9CC] hover:border-[#0F3A23] bg-white"
                        }`}
                      >
                        <div className="aspect-16/10 rounded-xl overflow-hidden mb-3 bg-[#FAF6F0]">
                          <img
                            src={base.image}
                            alt={base.name}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-base text-[#0F3A23]">
                              {base.name}
                            </h3>
                            <span className="font-serif font-bold text-xs text-[#0F3A23]">
                              ₹{base.price}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6E776F] mt-1 font-light leading-relaxed">
                            {base.description}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#0F3A23]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-[#0F3A23] text-white hover:bg-[#154D30] rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Next: Add Sweets</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: ADD SOMETHING SWEET ---------------- */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2D9CC] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F3A23]">
                      Step 2 of 5
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
                      Add something sweet
                    </h2>
                  </div>
                  <span className="text-xs text-[#6E776F] font-light">
                    {sweetsCount} treats selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {GIFT_SWEET_OPTIONS.map((sweet: any) => {
                    const qty = selectedSweets[sweet.id] || 0;
                    return (
                      <div
                        key={sweet.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          qty > 0
                            ? "border-[#0F3A23] bg-[#FAF6F0]"
                            : "border-[#E2D9CC] bg-white hover:border-[#0F3A23]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-sm text-[#0F3A23]">
                              {sweet.name}
                            </h3>
                            <span className="font-serif font-bold text-xs text-[#0F3A23]">
                              ₹{sweet.price}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6E776F] mt-1 font-light">
                            {sweet.description}
                          </p>
                        </div>

                        {/* Stepper */}
                        <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#FAF6F0]">
                          <span className="text-[11px] text-[#6E776F]">
                            {qty === 0 ? "Not added" : `${qty} in box`}
                          </span>

                          <div className="flex items-center gap-2 bg-white border border-[#E2D9CC] rounded-lg p-1">
                            <button
                              onClick={() => handleSweetQtyChange(sweet.id, -1)}
                              disabled={qty === 0}
                              className="p-1 text-[#6E776F] hover:text-[#0F3A23] disabled:opacity-30 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-4 text-center text-xs font-bold text-[#0F3A23]">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleSweetQtyChange(sweet.id, 1)}
                              className="p-1 text-[#6E776F] hover:text-[#0F3A23] cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 border border-[#E2D9CC] rounded-full text-xs font-semibold uppercase tracking-wider text-[#162820] hover:bg-[#FAF6F0] cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-[#0F3A23] text-white hover:bg-[#154D30] rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Next: Add Flowers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: ADD FLOWERS ---------------- */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2D9CC] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F3A23]">
                      Step 3 of 5
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
                      Add fresh flowers
                    </h2>
                  </div>
                  <span className="text-xs text-[#6E776F] font-light">
                    Optional floral accent
                  </span>
                </div>

                <div className="space-y-3">
                  {GIFT_FLOWER_OPTIONS.map((flower: any) => {
                    const isSelected = selectedFlowers.id === flower.id;
                    return (
                      <div
                        key={flower.id}
                        onClick={() => setSelectedFlowers(flower)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                          isSelected
                            ? "border-[#0F3A23] bg-[#FAF6F0] ring-1 ring-[#0F3A23]/20"
                            : "border-[#E2D9CC] bg-white hover:border-[#0F3A23]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-[#0F3A23] bg-[#0F3A23] text-white"
                                : "border-[#E2D9CC]"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-2" />}
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-sm sm:text-base text-[#0F3A23]">
                              {flower.name}
                            </h3>
                            <p className="text-[11px] text-[#6E776F] font-light">
                              {flower.description}
                            </p>
                          </div>
                        </div>

                        <span className="font-serif font-bold text-sm text-[#0F3A23] shrink-0">
                          {flower.price === 0 ? "Included" : `+₹${flower.price}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E2D9CC] text-[11px] text-[#6E776F] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0F3A23] shrink-0" />
                  <span>
                    Flower varieties depend on fresh morning availability. We handpick the freshest matching blooms.
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 border border-[#E2D9CC] rounded-full text-xs font-semibold uppercase tracking-wider text-[#162820] hover:bg-[#FAF6F0] cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 bg-[#0F3A23] text-white hover:bg-[#154D30] rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Next: Personal Note</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 4: PERSONAL TOUCH & CARD ---------------- */}
            {currentStep === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2D9CC] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F3A23]">
                      Step 4 of 5
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
                      Add a personal touch
                    </h2>
                  </div>
                  <span className="text-xs text-[#6E776F] font-light">
                    Greeting card &amp; note
                  </span>
                </div>

                {/* Card Type Toggle */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setCardType("handwritten")}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      cardType === "handwritten"
                        ? "border-[#0F3A23] bg-[#FAF6F0] ring-1 ring-[#0F3A23]/20 font-bold"
                        : "border-[#E2D9CC] text-[#6E776F] hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <span className="text-xs block text-[#0F3A23]">Handwritten</span>
                    <span className="text-[10px] text-[#0F3A23]">₹49</span>
                  </button>

                  <button
                    onClick={() => setCardType("printed")}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      cardType === "printed"
                        ? "border-[#0F3A23] bg-[#FAF6F0] ring-1 ring-[#0F3A23]/20 font-bold"
                        : "border-[#E2D9CC] text-[#6E776F] hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <span className="text-xs block text-[#0F3A23]">Printed Card</span>
                    <span className="text-[10px] text-[#0F3A23]">₹29</span>
                  </button>

                  <button
                    onClick={() => setCardType("none")}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      cardType === "none"
                        ? "border-[#0F3A23] bg-[#FAF6F0] ring-1 ring-[#0F3A23]/20 font-bold"
                        : "border-[#E2D9CC] text-[#6E776F] hover:bg-[#FAF6F0]"
                    }`}
                  >
                    <span className="text-xs block text-[#0F3A23]">No Card</span>
                    <span className="text-[10px] text-[#6E776F]">₹0</span>
                  </button>
                </div>

                {cardType !== "none" && (
                  <div className="space-y-4">
                    {/* Quick Prompts */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-2">
                        Quick Message Ideas (Tap to paste):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MESSAGE_SUGGESTIONS.map((msg: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setPersonalMessage(msg)}
                            className="px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E2D9CC] text-[11px] text-[#6E776F] hover:text-[#0F3A23] hover:border-[#0F3A23] transition-colors cursor-pointer text-left"
                          >
                            &ldquo;{msg}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                        Your Personal Message:
                      </label>
                      <textarea
                        rows={3}
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Write a sweet message to accompany your gift..."
                        className="w-full px-4 py-3 rounded-2xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs sm:text-sm text-[#162820] font-serif focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                      />
                    </div>

                    {/* Sender Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                        Signed from (Your Name / Nickname):
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Rahul / With love, Mom"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                      />
                    </div>

                    {/* Live Preview of Note */}
                    <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E2D9CC] relative">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#0F3A23] block mb-2">
                        Card Preview
                      </span>
                      <p className="font-serif italic text-sm text-[#162820] leading-relaxed">
                        &ldquo;{personalMessage || "Your message will appear here..."}&rdquo;
                      </p>
                      {senderName && (
                        <p className="text-xs font-serif font-semibold text-[#0F3A23] mt-2 text-right">
                          — {senderName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 border border-[#E2D9CC] rounded-full text-xs font-semibold uppercase tracking-wider text-[#162820] hover:bg-[#FAF6F0] cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-3 bg-[#0F3A23] text-white hover:bg-[#154D30] rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Next: Details &amp; Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 5: RECIPIENT & FULFILMENT ---------------- */}
            {currentStep === 5 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2D9CC] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F3A23]">
                      Step 5 of 5
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
                      Fulfilment &amp; Recipient
                    </h2>
                  </div>
                  <span className="text-xs text-[#6E776F] font-light">
                    Final Details
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Recipient Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                      Recipient Name (Optional):
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                      Your Contact Phone *
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>

                  {/* Fulfilment Method */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-2">
                      Fulfilment Method:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFulfilmentMethod("Pickup")}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          fulfilmentMethod === "Pickup"
                            ? "border-[#0F3A23] bg-[#FAF6F0] ring-1 ring-[#0F3A23]/20 font-bold"
                            : "border-[#E2D9CC] text-[#6E776F] hover:bg-[#FAF6F0]"
                        }`}
                      >
                        <span className="text-xs block text-[#0F3A23]">Cafe Pickup</span>
                        <span className="text-[10px] text-[#6E776F]">Free</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFulfilmentMethod("Delivery")}
                        disabled={!giftingSettings.deliveryEnabled}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          fulfilmentMethod === "Delivery"
                            ? "border-[#0F3A23] bg-[#FAF6F0] ring-1 ring-[#0F3A23]/20 font-bold"
                            : "border-[#E2D9CC] text-[#6E776F] hover:bg-[#FAF6F0]"
                        }`}
                      >
                        <span className="text-xs block text-[#0F3A23]">Local Delivery</span>
                        <span className="text-[10px] text-[#0F3A23]">
                          +₹{giftingSettings.deliveryFee || 49}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address if delivery */}
                  {fulfilmentMethod === "Delivery" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                        Delivery Address (Local area only) *
                      </label>
                      <textarea
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House / Flat No., Society / Street, Landmark"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                      />
                    </div>
                  )}

                  {/* Requested Date & Time */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                      Preferred Date:
                    </label>
                    <input
                      type="text"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      placeholder="Today / Tomorrow / 15 Oct"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                      Preferred Time:
                    </label>
                    <input
                      type="text"
                      value={requestedTime}
                      onChange={(e) => setRequestedTime(e.target.value)}
                      placeholder="e.g. 5:30 PM / Evening"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1">
                      Special Instructions (Optional):
                    </label>
                    <input
                      type="text"
                      value={specialNote}
                      onChange={(e) => setSpecialNote(e.target.value)}
                      placeholder="e.g. Don't reveal who it's from / Ring bell twice"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9CC] bg-[#FAF6F0] text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 border border-[#E2D9CC] rounded-full text-xs font-semibold uppercase tracking-wider text-[#162820] hover:bg-[#FAF6F0] cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Gift Summary Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2D9CC] shadow-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#FAF6F0]">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#0F3A23]" />
                  <h3 className="font-serif text-xl font-bold text-[#0F3A23]">
                    Your Gift Summary
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#0F3A23] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#E2D9CC]">
                  Live Preview
                </span>
              </div>

              {/* Itemized List */}
              <div className="space-y-3 text-xs">
                {/* Base */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="font-semibold text-[#0F3A23] block">
                      {selectedBase.name}
                    </span>
                    <span className="text-[11px] text-[#6E776F] font-light">
                      Base packaging
                    </span>
                  </div>
                  <span className="font-serif font-bold text-[#0F3A23]">
                    ₹{selectedBase.price}
                  </span>
                </div>

                {/* Sweets */}
                <div className="py-2 border-t border-[#FAF6F0]">
                  <div className="flex items-center justify-between text-[#0F3A23] font-semibold mb-1">
                    <span>Bakery Sweets ({sweetsCount})</span>
                    <span className="font-serif font-bold">₹{sweetsPrice}</span>
                  </div>
                  {sweetsCount === 0 ? (
                    <p className="text-[11px] text-amber-700 italic">
                      No sweets added yet
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-[#6E776F] font-light pl-2">
                      {Object.entries(selectedSweets).map(([id, qty]) => {
                        const sweet = GIFT_SWEET_OPTIONS.find((s: any) => s.id === id);
                        if (!sweet) return null;
                        return (
                          <li key={id} className="flex justify-between">
                            <span>
                              {qty}x {sweet.name}
                            </span>
                            <span className="font-serif">₹{sweet.price * qty}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Flowers */}
                <div className="flex items-center justify-between py-2 border-t border-[#FAF6F0]">
                  <div>
                    <span className="font-semibold text-[#0F3A23] block">
                      {selectedFlowers.name}
                    </span>
                    <span className="text-[11px] text-[#6E776F] font-light">
                      Fresh floral bunch
                    </span>
                  </div>
                  <span className="font-serif font-bold text-[#0F3A23]">
                    {selectedFlowers.price === 0 ? "₹0" : `₹${selectedFlowers.price}`}
                  </span>
                </div>

                {/* Card */}
                {cardType !== "none" && (
                  <div className="py-2 border-t border-[#FAF6F0]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0F3A23]">
                        {cardType === "handwritten" ? "Handwritten Note" : "Printed Card"}
                      </span>
                      <span className="font-serif font-bold text-[#0F3A23]">₹{cardPrice}</span>
                    </div>
                    {personalMessage && (
                      <p className="text-[10px] text-[#0F3A23] font-serif italic truncate mt-0.5">
                        &ldquo;{personalMessage}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Fulfilment details */}
                <div className="py-2 border-t border-[#FAF6F0] space-y-1 text-[11px] text-[#6E776F]">
                  <div className="flex justify-between">
                    <span>Fulfilment:</span>
                    <span className="font-medium text-[#0F3A23]">
                      {fulfilmentMethod}
                    </span>
                  </div>
                  {fulfilmentMethod === "Delivery" && (
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="font-medium font-serif text-[#0F3A23]">
                        ₹{deliveryFee}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Requested Time:</span>
                    <span className="font-medium text-[#0F3A23]">
                      {requestedDate}, {requestedTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t-2 border-[#0F3A23] flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-[#0F3A23]">
                    Estimated Total
                  </span>
                  <p className="text-[10px] text-[#6E776F]">
                    Subject to morning flower availability
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-[#0F3A23]">
                    ₹{total}
                  </span>
                </div>
              </div>

              {/* Disclaimers */}
              <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E2D9CC] text-[10px] text-[#6E776F] space-y-1">
                <div className="flex items-center gap-1 font-semibold text-[#0F3A23]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F3A23] shrink-0" />
                  <span>Cafe Order Confirmation</span>
                </div>
                <p className="font-light leading-relaxed">
                  Your order is confirmed directly with our cafe team over WhatsApp. We verify flower freshness, cake baking times, and recipient delivery address.
                </p>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleContinueOnWhatsApp}
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Continue on WhatsApp →</span>
                </button>

                <button
                  onClick={handleSaveToBag}
                  className="w-full py-3 bg-[#0F3A23] hover:bg-[#154D30] text-white border border-[#0F3A23] rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C99742]" />
                  <span>Add Gift to Order Bag</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cakes & Celebration Callout Banner */}
      <CakesCelebrationBanner />
    </div>
  );
};

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "../context/OrderContext";
import { useData } from "../context/DataContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { BotanicalSprig } from "../components/BotanicalSprig";
import { CakesCelebrationBanner } from "../components/CakesCelebrationBanner";
import { CampusLocationPicker } from "../components/CampusLocationPicker";
import { type CampusDeliveryLocation } from "../data/campusBoundary";
import {
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  ShoppingBag,
  Coffee,
  MessageCircle,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { validateCoupon } from "../services/adminService";

export const OrderPage: React.FC = () => {
  const { user, customerProfile } = useCustomerAuth();
  const {
    items,
    updateQuantity,
    removeItem,
    clearOrder,
    totalCount,
    totalAmount,
  } = useOrder();

  const { addOrder } = useData();

  // 4 Steps: 1: Cart, 2: Delivery Details, 3: Payment, 4: Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [customerName, setCustomerName] = useState(
    customerProfile?.name || user?.displayName || ""
  );
  const [customerPhone, setCustomerPhone] = useState(customerProfile?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(
    customerProfile?.email || user?.email || ""
  );
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway" | "Delivery">("Takeaway");
  const [campusLocation, setCampusLocation] = useState<CampusDeliveryLocation | null>(
    customerProfile?.defaultDeliveryLocation || null
  );
  const [tableNumber, setTableNumber] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Auto-fill from profile/user when loaded
  React.useEffect(() => {
    if (customerProfile || user) {
      if (!customerName) setCustomerName(customerProfile?.name || user?.displayName || "");
      if (!customerPhone && customerProfile?.phone) setCustomerPhone(customerProfile.phone);
      if (!customerEmail) setCustomerEmail(customerProfile?.email || user?.email || "");
      if (!campusLocation && customerProfile?.defaultDeliveryLocation) {
        setCampusLocation(customerProfile.defaultDeliveryLocation);
      }
    }
  }, [customerProfile, user]);

  // Promo Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const deliveryFee = orderType === "Delivery" && totalAmount > 0 ? 40 : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, totalAmount + deliveryFee - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    setIsValidatingCoupon(true);
    const res = await validateCoupon(couponInput.trim(), totalAmount);
    setIsValidatingCoupon(false);
    if (res.success && res.coupon) {
      setAppliedCoupon({
        code: res.coupon.code,
        discountAmount: res.coupon.discountAmount,
      });
      setCouponInput("");
    } else {
      setCouponError(res.error || "Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleProceedToDetails = () => {
    if (items.length === 0) return;
    setFormError(null);
    setCurrentStep(2);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (orderType === "Delivery") {
      if (!campusLocation || !campusLocation.isVerifiedCampus) {
        setFormError(
          "Please select and confirm a valid delivery location inside the CSJMU university campus."
        );
        return;
      }
    }

    setCurrentStep(3);
  };

  const handleConfirmOrder = async () => {
    let idToken: string | undefined = undefined;
    if (user) {
      try {
        idToken = await user.getIdToken();
      } catch {}
    }

    const orderRecord = addOrder({
      customerId: user?.uid || undefined,
      customerEmail: customerEmail.trim() || user?.email || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: items.map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        quantity,
        price: item.price,
        recipientName: item.recipientName || undefined,
      })),
      subtotal: totalAmount,
      deliveryFee,
      discountAmount,
      couponCode: appliedCoupon?.code,
      totalAmount: grandTotal,
      status: "Pending",
      orderType,
      tableNumber: orderType === "Dine-in" && tableNumber ? tableNumber.trim() : undefined,
      paymentMethod: "UPI / QR / Cash",
      paymentStatus: "Pending",
      note: specialRequest.trim() || undefined,
      deliveryLocation:
        orderType === "Delivery" && campusLocation ? campusLocation : undefined,
    }, idToken);

    setPlacedOrder(orderRecord);
    clearOrder();
    setCurrentStep(4);
  };

  return (
    <div className="bg-[#F5EFEB] text-[#162820] min-h-screen">
      {/* ==================================================
          1. TOP ANNOUNCEMENT BANNER (Matching PDF Page 5)
          ================================================== */}
      <div className="bg-[#FAF6F0] border-b border-[#E2D9CC] py-3.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BotanicalSprig side="left" />
            <div className="text-left">
              <span className="font-serif italic text-base sm:text-lg font-bold text-[#0F3A23] block leading-tight">
                More Stories Coming Soon...
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#6E776F]">
                STAY TUNED FOR MORE MOMENTS, MORE GOOD FOOD AND HAPPIER DAYS.
              </span>
            </div>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0F3A23] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#154D30] transition-colors shrink-0"
          >
            <span>Follow Us on Instagram</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ==================================================
          2. ORDER NOW HERO (Matching PDF Page 5)
          ================================================== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left: Headline & Subtitle */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.32em] uppercase text-[#6E776F] block">
                ORDER NOW
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F3A23] tracking-tight leading-tight">
                Good Food,<br />
                <span className="italic font-bold">Right to Your Door.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#162820]/80 font-light max-w-md">
                Choose your favourites, add your details and we’ll take care of the rest.
              </p>
            </div>

            {/* Right: Arched Cake Photo Cutout (matching PDF Page 5) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-t-full rounded-b-2xl overflow-hidden shadow-xl border-4 border-white bg-[#082118] w-full max-w-sm aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80"
                  alt="Delicious cakes and coffee ready for delivery"
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-104"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. 4-STEP PROGRESS STEPPER (Matching PDF Page 5)
          ================================================== */}
      <section className="border-y border-[#E2D9CC] bg-[#FAF6F0] py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 1
                    ? "bg-[#0F3A23] text-white"
                    : "bg-[#E8DFD1] text-[#6E776F]"
                }`}
              >
                1
              </span>
              <span
                className={`text-xs uppercase tracking-wider font-semibold ${
                  currentStep === 1 ? "text-[#0F3A23]" : "text-[#6E776F]"
                }`}
              >
                Cart
              </span>
            </div>

            <div className="flex-1 h-[1px] bg-[#E2D9CC] mx-3 sm:mx-6" />

            {/* Step 2 */}
            <div className="flex items-center gap-2.5">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 2
                    ? "bg-[#0F3A23] text-white"
                    : "bg-[#E8DFD1] text-[#6E776F]"
                }`}
              >
                2
              </span>
              <span
                className={`text-xs uppercase tracking-wider font-semibold ${
                  currentStep === 2 ? "text-[#0F3A23]" : "text-[#6E776F]"
                }`}
              >
                Delivery Details
              </span>
            </div>

            <div className="flex-1 h-[1px] bg-[#E2D9CC] mx-3 sm:mx-6" />

            {/* Step 3 */}
            <div className="flex items-center gap-2.5">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 3
                    ? "bg-[#0F3A23] text-white"
                    : "bg-[#E8DFD1] text-[#6E776F]"
                }`}
              >
                3
              </span>
              <span
                className={`text-xs uppercase tracking-wider font-semibold ${
                  currentStep === 3 ? "text-[#0F3A23]" : "text-[#6E776F]"
                }`}
              >
                Payment
              </span>
            </div>

            <div className="flex-1 h-[1px] bg-[#E2D9CC] mx-3 sm:mx-6" />

            {/* Step 4 */}
            <div className="flex items-center gap-2.5">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 4
                    ? "bg-[#0F3A23] text-white"
                    : "bg-[#E8DFD1] text-[#6E776F]"
                }`}
              >
                4
              </span>
              <span
                className={`text-xs uppercase tracking-wider font-semibold ${
                  currentStep === 4 ? "text-[#0F3A23]" : "text-[#6E776F]"
                }`}
              >
                Confirmation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. 2-COLUMN SPLIT CART & CHECKOUT LAYOUT (Matching PDF Page 5)
          ================================================== */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentStep === 4 ? (
            /* Confirmation View */
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#E2D9CC] text-center shadow-lg space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#E6F0EB] text-[#0F3A23] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h2 className="font-serif text-3xl font-bold text-[#0F3A23]">
                Order Confirmed!
              </h2>

              <p className="text-sm text-[#6E776F] font-light max-w-sm mx-auto">
                Thank you, {customerName}! Your order{" "}
                <span className="font-bold text-[#0F3A23]">#{placedOrder?.id}</span>{" "}
                has been received and is being prepared fresh in the cafe.
              </p>

              <div className="bg-[#FAF6F0] rounded-2xl p-4 text-left text-xs space-y-2.5 border border-[#E2D9CC]">
                <div className="flex justify-between">
                  <span className="text-[#6E776F]">Order Type</span>
                  <span className="font-semibold text-[#0F3A23]">{orderType}</span>
                </div>
                {orderType === "Delivery" && placedOrder?.deliveryLocation && (
                  <div className="p-3 bg-[#E6F0EB] rounded-xl border border-[#0F3A23]/15 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F3A23]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F3A23]" />
                      <span>CSJMU Campus Delivery</span>
                    </div>
                    <p className="font-semibold text-[#162820]">
                      {placedOrder.deliveryLocation.building}
                      {placedOrder.deliveryLocation.room ? `, ${placedOrder.deliveryLocation.room}` : ""}
                    </p>
                    {placedOrder.deliveryLocation.instructions && (
                      <p className="text-[11px] text-[#6E776F] italic">
                        Note: &ldquo;{placedOrder.deliveryLocation.instructions}&rdquo;
                      </p>
                    )}
                    <p className="text-[10px] text-[#6E776F] font-mono">
                      GPS: {placedOrder.deliveryLocation.lat.toFixed(5)}, {placedOrder.deliveryLocation.lng.toFixed(5)}
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6E776F]">Total Amount</span>
                  <span className="font-bold text-[#0F3A23]">₹{grandTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E776F]">Estimated Ready</span>
                  <span className="font-semibold text-[#0F3A23]">15 - 25 mins</span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="px-6 py-2.5 rounded-full bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#154D30]"
                >
                  Back to Home
                </Link>
                <Link
                  to="/menu"
                  className="px-6 py-2.5 rounded-full border border-[#0F3A23] text-[#0F3A23] text-xs font-semibold uppercase tracking-wider hover:bg-[#FAF6F0]"
                >
                  Order More
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column (8/12) */}
              <div className="lg:col-span-8 space-y-6">
                {currentStep === 1 && (
                  /* Step 1: Cart Items List */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
                      <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
                        Your Cart ({totalCount} {totalCount === 1 ? "item" : "items"})
                      </h2>
                      <Link
                        to="/menu"
                        className="text-xs uppercase tracking-wider font-semibold text-[#0F3A23] hover:underline"
                      >
                        Continue Shopping
                      </Link>
                    </div>

                    {items.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center border border-[#E2D9CC] space-y-4">
                        <ShoppingBag className="w-12 h-12 text-[#6E776F] opacity-30 mx-auto" />
                        <h3 className="font-serif text-xl font-bold text-[#0F3A23]">
                          Your bag is currently empty
                        </h3>
                        <p className="text-xs text-[#6E776F] max-w-sm mx-auto font-light">
                          Explore our comforting vegetarian menu of fresh bakes, savoury bites, and iced coffees.
                        </p>
                        <Link
                          to="/menu"
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#154D30]"
                        >
                          Explore Menu
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map(({ item, quantity }) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2D9CC] shadow-2xs flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-[#3D271D] shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="font-serif text-lg font-bold text-[#0F3A23] truncate">
                                  {item.name}
                                </h4>
                                <span className="text-xs text-[#6E776F] block">
                                  {item.category.replace("-", " ").toUpperCase()}
                                </span>
                                <span className="font-serif text-base font-bold text-[#0F3A23] mt-1 block">
                                  ₹{item.price * quantity}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Quantity Stepper (matching PDF Page 5) */}
                              <div className="inline-flex items-center gap-2 bg-[#FAF6F0] border border-[#E2D9CC] rounded-full px-2.5 py-1">
                                <button
                                  onClick={() => updateQuantity(item.id, quantity - 1)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#E8DFD1] text-[#0F3A23]"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-[#0F3A23] min-w-4 text-center">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, quantity + 1)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#E8DFD1] text-[#0F3A23]"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-[#6E776F] hover:text-rose-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Special Request Accordion Box (matching PDF Page 5) */}
                        <div className="bg-white rounded-2xl border border-[#E2D9CC] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                            className="w-full p-4.5 flex items-center justify-between text-left hover:bg-[#FAF6F0]/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <MessageCircle className="w-4 h-4 text-[#0F3A23]" />
                              <div>
                                <span className="text-xs font-semibold text-[#0F3A23] uppercase tracking-wider block">
                                  Have a special request?
                                </span>
                                <span className="text-[11px] text-[#6E776F] font-light">
                                  Add a note (e.g. no nuts, extra chocolate, warm patties, etc.)
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-[#0F3A23] font-bold">
                              {isNoteExpanded ? "▲" : "▼"}
                            </span>
                          </button>

                          {isNoteExpanded && (
                            <div className="p-4.5 pt-0 border-t border-[#FAF6F0]">
                              <textarea
                                rows={2}
                                value={specialRequest}
                                onChange={(e) => setSpecialRequest(e.target.value)}
                                placeholder="Write your special instructions here..."
                                className="w-full p-3 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  /* Step 2: Delivery Details Form */
                  <form onSubmit={handleProceedToPayment} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2D9CC] space-y-6">
                    <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
                      <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
                        Delivery &amp; Customer Details
                      </h2>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-[#6E776F] hover:text-[#0F3A23] inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Cart</span>
                      </button>
                    </div>

                    {formError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                        {formError}
                      </div>
                    )}

                    {/* Order Type Selector */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-2">
                        Order Type
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["Takeaway", "Dine-in", "Delivery"] as const).map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setOrderType(type)}
                            className={`py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all border ${
                              orderType === type
                                ? "bg-[#0F3A23] text-white border-[#0F3A23]"
                                : "bg-white text-[#162820] border-[#E2D9CC] hover:bg-[#FAF6F0]"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name, Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                          Phone Number (10 digits) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                          Email Address (for order updates)
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="e.g. rahul@example.com"
                          className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                        />
                      </div>
                    </div>

                    {/* CSJMU Campus Location Picker */}
                    {orderType === "Delivery" && (
                      <div className="pt-1">
                        <CampusLocationPicker
                          initialLocation={campusLocation}
                          customerName={customerName}
                          customerPhone={customerPhone}
                          onLocationConfirmed={(loc) => {
                            setCampusLocation(loc);
                            setFormError(null);
                          }}
                        />
                      </div>
                    )}

                    {orderType === "Dine-in" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                          Table Number (optional)
                        </label>
                        <input
                          type="text"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="e.g. Table 4"
                          className="w-full p-2.5 rounded-xl border border-[#E2D9CC] text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#154D30] transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}

                {currentStep === 3 && (
                  /* Step 3: Payment Selection */
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2D9CC] space-y-6">
                    <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
                      <h2 className="font-serif text-2xl font-bold text-[#0F3A23]">
                        Select Payment Method
                      </h2>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs text-[#6E776F] hover:text-[#0F3A23] inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Details</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#0F3A23] bg-[#FAF6F0] cursor-pointer">
                        <input type="radio" name="payment" defaultChecked className="text-[#0F3A23]" />
                        <div>
                          <span className="text-xs font-bold text-[#0F3A23] block">
                            UPI / QR / Cash on Pickup / Delivery
                          </span>
                          <span className="text-[11px] text-[#6E776F]">
                            Pay conveniently upon receiving your fresh bakes.
                          </span>
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={handleConfirmOrder}
                      className="w-full py-3.5 rounded-full bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#154D30] transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Confirm &amp; Place Order (₹{grandTotal})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column (4/12): Order Summary Card (Matching PDF Page 5) */}
              <div className="lg:col-span-4 sticky top-36 space-y-5">
                <div className="bg-white rounded-2xl p-6 border border-[#E2D9CC] shadow-lg space-y-5">
                  <h3 className="font-serif text-xl font-bold text-[#0F3A23] border-b border-[#FAF6F0] pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-[#6E776F]">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#162820]">₹{totalAmount}</span>
                    </div>

                    <div className="flex justify-between text-[#6E776F]">
                      <span>Delivery Fee</span>
                      <span className="font-medium text-[#162820]">
                        {deliveryFee > 0 ? `₹${deliveryFee}` : "Free"}
                      </span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex justify-between text-emerald-700 font-semibold items-center bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Promo ({appliedCoupon.code})</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span>-₹{appliedCoupon.discountAmount}</span>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-stone-400 hover:text-stone-700 font-bold ml-1 cursor-pointer"
                            title="Remove promo code"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="pt-1">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Promo Code (e.g. WELCOME10)"
                            className="flex-1 p-2 bg-[#FAF6F0] border border-[#E2D9CC] rounded-xl text-[11px] font-mono uppercase text-[#162820] focus:outline-hidden focus:border-[#0F3A23]"
                          />
                          <button
                            type="submit"
                            disabled={isValidatingCoupon || !couponInput.trim()}
                            className="px-3 py-2 bg-[#0F3A23] hover:bg-[#154D30] text-white text-[11px] font-semibold uppercase tracking-wider rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {isValidatingCoupon ? "..." : "Apply"}
                          </button>
                        </div>
                        {couponError && (
                          <span className="text-[10px] text-rose-600 block mt-1">
                            {couponError}
                          </span>
                        )}
                      </form>
                    )}

                    <div className="flex justify-between text-base font-serif font-bold text-[#0F3A23] pt-3 border-t border-[#FAF6F0]">
                      <span>Total</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>

                  {currentStep === 1 && (
                    <button
                      onClick={handleProceedToDetails}
                      disabled={items.length === 0}
                      className="w-full py-3.5 rounded-full bg-[#0F3A23] hover:bg-[#154D30] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Delivery Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Trust Badges (matching PDF Page 5) */}
                  <div className="border-t border-[#FAF6F0] pt-4 space-y-2.5 text-[11px] text-[#6E776F]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E6F0EB] flex items-center justify-center text-[#0F3A23] shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0F3A23] block leading-tight">Freshly Baked</span>
                        <span className="text-[10px] text-[#6E776F]">Made with love, everyday.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E6F0EB] flex items-center justify-center text-[#0F3A23] shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0F3A23] block leading-tight">Quality Ingredients</span>
                        <span className="text-[10px] text-[#6E776F]">Only the best, always.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E6F0EB] flex items-center justify-center text-[#0F3A23] shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0F3A23] block leading-tight">A Sweeter Day</span>
                        <span className="text-[10px] text-[#6E776F]">Good food, better days.</span>
                      </div>
                    </div>
                  </div>

                  {/* Upsell Card (matching PDF Page 5 bottom right) */}
                  <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E2D9CC] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F3A23] text-white flex items-center justify-center shrink-0">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-serif text-sm font-bold text-[#0F3A23] block">
                        Add a little extra?
                      </span>
                      <p className="text-[10px] text-[#6E776F]">
                        Pair your desserts with our special coffees!
                      </p>
                      <Link
                        to="/menu?category=beverages"
                        className="text-[11px] font-semibold text-[#0F3A23] hover:underline mt-0.5 block"
                      >
                        Explore Beverages →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          5. CELEBRATION CAKES BANNER (Matching PDF Page 7)
          ================================================== */}
      <CakesCelebrationBanner />
    </div>
  );
};

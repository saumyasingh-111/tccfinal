import React, { useState } from "react";
import { useOrder } from "../context/OrderContext";
import { useData } from "../context/DataContext";
import { VegBadge } from "./VegBadge";
import {
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Gift,
  CheckCircle2,
  Info,
} from "lucide-react";

export const QuickOrderDrawer: React.FC = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearOrder,
    totalCount,
    totalAmount,
  } = useOrder();

  const { addOrder, cafeInfo } = useData();

  // Drawer workflow step: 'cart' | 'checkout' | 'success'
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");

  // Checkout form fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway" | "Delivery">("Takeaway");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{
    id: string;
    totalAmount: number;
    itemsCount: number;
    orderType: string;
    createdAt: string;
  } | null>(null);

  if (!isDrawerOpen) return null;

  const deliveryFee = orderType === "Delivery" ? 40 : 0;
  const grandTotal = totalAmount + deliveryFee;

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    setFormError(null);
    setStep("checkout");
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!customerName.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (orderType === "Delivery" && !deliveryAddress.trim()) {
      setFormError("Please provide your delivery address.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const orderRecord = addOrder({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          items: items.map(({ item, quantity }) => ({
            id: item.id,
            name: item.name,
            quantity,
            price: item.price,
          })),
          totalAmount: grandTotal,
          status: "Pending",
          orderType,
          note:
            orderNotes.trim() ||
            (orderType === "Dine-in" && tableNumber
              ? `Table #${tableNumber}`
              : orderType === "Delivery"
              ? `Address: ${deliveryAddress}`
              : undefined),
        });

        setPlacedOrderInfo({
          id: orderRecord.id,
          totalAmount: grandTotal,
          itemsCount: totalCount,
          orderType,
          createdAt: orderRecord.createdAt,
        });

        // Clear active cart bag
        clearOrder();
        setIsSubmitting(false);
        setStep("success");
      } catch {
        setIsSubmitting(false);
        setFormError("Could not record order. Please try again or WhatsApp us directly.");
      }
    }, 600);
  };

  const handleClose = () => {
    setStep("cart");
    setFormError(null);
    closeDrawer();
  };

  // Format WhatsApp message with placed order details
  const getWhatsAppConfirmationUrl = () => {
    if (!placedOrderInfo) return "#";
    const msg = `*NEW ORDER #${placedOrderInfo.id} — THE CLASSIC CRUSH*
Customer: ${customerName} (${customerPhone})
Fulfillment: ${placedOrderInfo.orderType}
Total: ₹${placedOrderInfo.totalAmount}
Time: ${placedOrderInfo.createdAt}
${orderNotes ? `Notes: ${orderNotes}` : ""}

Please confirm my order. Thank you!`;

    return `https://wa.me/${cafeInfo.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-hero-fade">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#F5EFEB] shadow-2xl flex flex-col justify-between border-l border-[#E2D9CC]">
          {/* ==============================================================
              1. DRAWER HEADER
              ============================================================== */}
          <div className="p-5 sm:p-6 border-b border-[#E2D9CC] flex items-center justify-between bg-white/80">
            <div className="flex items-center gap-3">
              {step === "checkout" && (
                <button
                  onClick={() => setStep("cart")}
                  className="p-1 -ml-1 text-[#0F3A23] hover:text-[#154D30] transition-colors cursor-pointer"
                  title="Back to bag"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-9 h-9 rounded-full bg-[#E6F0EB] flex items-center justify-center text-[#0F3A23]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F3A23]">
                  {step === "cart"
                    ? "Your Order Bag"
                    : step === "checkout"
                    ? "Checkout Details"
                    : "Order Confirmed!"}
                </h3>
                <p className="text-xs text-[#6E776F]">
                  {step === "cart"
                    ? `${totalCount} ${totalCount === 1 ? "item" : "items"} selected`
                    : step === "checkout"
                    ? "Provide fulfillment info"
                    : "Sent to the café kitchen"}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-[#6E776F] hover:text-[#0F3A23] rounded-lg transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ==============================================================
              2. DRAWER BODY (CART, CHECKOUT, OR SUCCESS)
              ============================================================== */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* -------------------- STEP 1: CART ITEMS -------------------- */}
            {step === "cart" && (
              <>
                {items.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#E8DFD1]/50 flex items-center justify-center text-[#162820]">
                      <ShoppingBag className="w-7 h-7 stroke-1 text-[#0F3A23]" />
                    </div>
                    <h4 className="font-serif text-xl font-bold text-[#0F3A23]">Your bag is empty</h4>
                    <p className="text-xs text-[#6E776F] max-w-xs font-light">
                      Explore our 100% pure vegetarian menu and tap &ldquo;+ Add&rdquo; to begin your order.
                    </p>
                    <button
                      onClick={() => {
                        handleClose();
                        window.location.href = "/menu";
                      }}
                      className="mt-3 px-6 py-2.5 rounded-full bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2D9CC]">
                      <span className="text-xs font-semibold text-[#0F3A23] uppercase tracking-wider">
                        Selected Items ({totalCount})
                      </span>
                      <button
                        onClick={clearOrder}
                        className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear all</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {items.map(({ item, quantity }) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-3 border border-[#E2D9CC] flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#E2D9CC]"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.isGift ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold bg-[#E6F0EB] text-[#0F3A23] px-1.5 py-0.5 rounded-md">
                                    <Gift className="w-2.5 h-2.5" />
                                    <span>Gift Box</span>
                                  </span>
                                ) : (
                                  <VegBadge size="sm" />
                                )}
                                <h5 className="font-serif font-bold text-sm text-[#0F3A23] truncate">
                                  {item.name}
                                </h5>
                              </div>
                              <p className="text-xs text-[#6E776F] font-medium mt-0.5">
                                ₹{item.price} each
                              </p>
                            </div>
                          </div>

                          {/* Stepper & Total */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E2D9CC] rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 text-[#6E776F] hover:text-[#0F3A23] cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center text-[#0F3A23]">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 text-[#6E776F] hover:text-[#0F3A23] cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-bold font-serif text-[#0F3A23] min-w-[40px] text-right">
                              ₹{item.price * quantity}
                            </span>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* -------------------- STEP 2: CHECKOUT FORM -------------------- */}
            {step === "checkout" && (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Fulfillment Option Selector */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#0F3A23] block mb-2">
                    Fulfillment Option
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Takeaway", "Dine-in", "Delivery"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setOrderType(type)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                          orderType === type
                            ? "bg-[#0F3A23] text-[#FAF6F0] border-[#0F3A23] shadow-xs"
                            : "bg-white text-[#162820] border-[#E2D9CC] hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-[#0F3A23] block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-[#0F3A23] block mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                  />
                </div>

                {/* Contextual field: Table # for Dine-in */}
                {orderType === "Dine-in" && (
                  <div>
                    <label className="text-xs font-semibold text-[#0F3A23] block mb-1">
                      Table Number (Optional if already seated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Table 4 / Window Corner"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>
                )}

                {/* Contextual field: Address for Delivery */}
                {orderType === "Delivery" && (
                  <div>
                    <label className="text-xs font-semibold text-[#0F3A23] block mb-1">
                      Delivery Address &amp; Landmark *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Flat #, Building, Street, Landmark"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                    />
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="text-xs font-semibold text-[#0F3A23] block mb-1">
                    Special Cooking / Dietary Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra chili flakes, less sweet cold coffee"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-none focus:ring-1 focus:ring-[#0F3A23]"
                  />
                </div>

                {/* Payment Notice */}
                <div className="p-3 bg-white rounded-xl border border-[#E2D9CC] text-[11px] text-[#6E776F] space-y-1">
                  <p className="font-semibold text-[#0F3A23]">Payment Method:</p>
                  <p>Cash, UPI (GPay/PhonePe/Paytm), or Card at the cafe counter / upon delivery.</p>
                </div>
              </form>
            )}

            {/* -------------------- STEP 3: ORDER SUCCESS -------------------- */}
            {step === "success" && placedOrderInfo && (
              <div className="text-center py-8 space-y-5 animate-hero-fade">
                <div className="w-16 h-16 rounded-full bg-[#E6F0EB] text-[#0F3A23] flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F3A23] bg-[#E6F0EB] px-3 py-1 rounded-full">
                    Order Received
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-[#0F3A23] mt-2">
                    Order #{placedOrderInfo.id}
                  </h4>
                  <p className="text-xs text-[#6E776F] mt-1">
                    Thank you, {customerName}! Your order has been placed directly into our kitchen system.
                  </p>
                </div>

                {/* Order Summary Receipt Box */}
                <div className="bg-white rounded-2xl p-4 border border-[#E2D9CC] text-left text-xs space-y-2 shadow-2xs">
                  <div className="flex justify-between py-1 border-b border-[#FAF6F0]">
                    <span className="text-[#6E776F]">Fulfillment Type:</span>
                    <span className="font-semibold text-[#0F3A23]">{placedOrderInfo.orderType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF6F0]">
                    <span className="text-[#6E776F]">Total Items:</span>
                    <span className="font-semibold text-[#0F3A23]">{placedOrderInfo.itemsCount} items</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF6F0]">
                    <span className="text-[#6E776F]">Grand Total:</span>
                    <span className="font-serif font-bold text-base text-[#0F3A23]">₹{placedOrderInfo.totalAmount}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6E776F]">Estimated Prep Time:</span>
                    <span className="font-semibold text-[#0F3A23]">~15-20 mins</span>
                  </div>
                </div>

                {/* Pre-filled WhatsApp notification button */}
                <div className="space-y-2 pt-2">
                  <a
                    href={getWhatsAppConfirmationUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Send Copy to Café WhatsApp</span>
                  </a>

                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 text-xs font-semibold text-[#0F3A23] hover:underline cursor-pointer"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ==============================================================
              3. DRAWER FOOTER
              ============================================================== */}
          {items.length > 0 && step !== "success" && (
            <div className="p-5 sm:p-6 border-t border-[#E2D9CC] bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-[#162820]">
                <div className="flex items-center justify-between text-[#6E776F]">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-[#162820]">₹{totalAmount}</span>
                </div>
                {orderType === "Delivery" && (
                  <div className="flex items-center justify-between text-[#6E776F]">
                    <span>Delivery Charge</span>
                    <span className="text-[#162820]">₹{deliveryFee}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-base font-bold text-[#0F3A23] pt-2 border-t border-[#FAF6F0]">
                  <span className="font-serif">Total Amount</span>
                  <span className="font-serif text-xl text-[#0F3A23]">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {step === "cart" ? (
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 bg-[#0F3A23] hover:bg-[#154D30] text-white font-semibold text-xs uppercase tracking-[0.16em] rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#0F3A23] hover:bg-[#154D30] text-white font-semibold text-xs uppercase tracking-[0.16em] rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 group"
                >
                  <span>{isSubmitting ? "Placing Order..." : `Confirm & Place Order (₹${grandTotal})`}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

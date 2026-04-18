import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/useCartStore";
import { useOrderStore } from "../../store/useOrderStore";
import { useRestaurantContext } from "../../hooks/useRestaurantContext";
import { API_BASE_URL } from "../../lib/api";
import { toast } from "sonner";
import { Order } from "../../types";

export default function CartPage() {
  const { restaurantId, tableId } = useRestaurantContext();
  const cart = useCartStore();
  const orderStore = useOrderStore();
  const navigate = useNavigate();

  const [note, setNote] = useState("");
  const [aiAdded, setAiAdded] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  // Computed totals from the real cart store
  const subtotal = cart.getSubtotal() + (aiAdded ? 6 : 0);
  const platformFee = 2.5;
  const tax = +(subtotal * 0.086).toFixed(2);
  const total = +(subtotal + platformFee + tax).toFixed(2);
  const pts = Math.round(subtotal * 2.2);

  // ── Place Order ─────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!restaurantId) {
      toast.error("No restaurant context — please scan the QR code again.");
      return;
    }

    setIsPlacing(true);
    try {
      const payload: Record<string, unknown> = {
        table_id: tableId || null,
        notes: note || undefined,
        items: cart.items.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          instructions: item.instructions || undefined,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/api/orders/public/${restaurantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).detail ?? "Failed to place order");
      }

      const order: Order = await res.json();
      orderStore.setActiveOrder(order);
      cart.clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-status/${order.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Error placing order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="lume-bg lume-text font-inter min-h-screen selection:bg-[#c3f5ff]/20 selection:text-[#c3f5ff]">

      {/* ── Top Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-xl border-b border-[#3b494c]/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/customer/menu" className="p-2 bg-[#c3f5ff]/10 rounded-full text-[#c3f5ff] hover:bg-[#c3f5ff]/20 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] font-manrope">
              LUME
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/customer" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Home</Link>
            <Link to="/customer/book" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Reserve</Link>
            <Link to="/customer/menu" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Menu</Link>
            <Link to="/customer/ai" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">AI Assistant</Link>
            <Link to="/customer/cart" className="text-[#00e5ff] font-medium border-b-2 border-[#00e5ff] px-3 py-2 text-sm">Cart</Link>
          </div>

          <div className="flex gap-2">
            <div className="p-2 bg-[#c3f5ff]/10 text-[#00e5ff] rounded-full flex items-center justify-center relative shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
              {cart.items.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#e9c349] border-2 border-[#131314] rounded-full" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-20 pb-32 px-4 max-w-2xl mx-auto">

        {/* Title + Progress */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl sm:text-3xl font-manrope font-black tracking-tight text-[#e5e2e3] mb-4">
            Review your order
          </h1>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
            {[
              { n: 1, label: "Cart", active: true },
              { n: 2, label: "Payment", active: false },
              { n: 3, label: "Confirm", active: false },
            ].map((step, i, arr) => (
              <div key={step.n} className="flex items-center gap-4 sm:gap-6 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                    step.active ? "bg-[#00e5ff] text-[#00363d]" : "border border-[#3b494c] text-[#bac9cc]"
                  }`}>
                    {step.n}
                  </div>
                  <span className={`text-xs font-bold ${step.active ? "text-[#c3f5ff]" : "text-[#bac9cc]"}`}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-6 sm:w-10 h-px bg-[#3b494c]/30" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {cart.items.length === 0 && !aiAdded && (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-5xl text-[#3b494c] mb-4 block">shopping_cart</span>
            <p className="text-[#bac9cc] font-bold text-lg mb-2">Your cart is empty</p>
            <p className="text-[#849396] text-sm mb-8">Add some dishes from the menu</p>
            <Link to="/customer/menu" className="bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#00363d] px-8 py-3 rounded-xl font-bold text-sm inline-block">
              Browse Menu
            </Link>
          </div>
        )}

        {/* Items Section */}
        {(cart.items.length > 0 || aiAdded) && (
          <>
            <div className="bg-[#1c1b1c] rounded-3xl p-5 sm:p-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 shadow-xl border border-[#3b494c]/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-manrope font-black text-[#e5e2e3]">Your Items</h2>
                <span className="px-3 py-1 bg-[#c3f5ff]/10 border border-[#c3f5ff]/15 rounded-full text-[#c3f5ff] text-[10px] font-black tracking-widest uppercase">
                  {cart.items.length + (aiAdded ? 1 : 0)} Items
                </span>
              </div>

              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-[#3b494c]/20 last:border-0 last:pb-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-lg flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#252425] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#3b494c] text-3xl">restaurant</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm sm:text-base font-manrope font-extrabold text-[#e5e2e3] truncate pr-2">
                          {item.name}
                        </h3>
                        <span className="text-sm sm:text-base font-manrope font-black text-[#c3f5ff]">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#bac9cc] leading-relaxed line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-[#0e0e0f] rounded-xl px-3 py-1.5 border border-[#3b494c]/20">
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                            className="text-[#bac9cc] hover:text-[#c3f5ff] active:scale-90 transition-all font-bold"
                          >
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>
                          <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                            className="text-[#bac9cc] hover:text-[#c3f5ff] active:scale-90 transition-all font-bold"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                        <button
                          onClick={() => cart.removeItem(item.id)}
                          className="text-[#ffb4ab]/70 hover:text-[#ffb4ab] flex items-center gap-1 text-[11px] font-bold"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Item Tag-along */}
                {aiAdded && (
                  <div className="flex gap-4 pb-6 border-b border-[#3b494c]/20 animate-in slide-in-from-left-4 duration-300">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#e9c349]/10 border border-[#e9c349]/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#e9c349] text-3xl">local_drink</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm sm:text-base font-manrope font-extrabold text-[#e5e2e3]">Sparkling Yuzu Soda</h3>
                        <span className="text-sm sm:text-base font-manrope font-black text-[#c3f5ff]">₹6.00</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#bac9cc] mb-3">
                        AI Recommended · Refreshing citrus soda
                      </p>
                      <button
                        onClick={() => setAiAdded(false)}
                        className="text-[#ffb4ab]/70 hover:text-[#ffb4ab] flex items-center gap-1 text-[11px] font-bold"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Recommendation Banner */}
              {!aiAdded && (
                <div className="mt-8 bg-[#e9c349]/5 border border-[#e9c349]/20 border-l-4 border-l-[#e9c349] rounded-2xl p-4 flex items-center gap-4">
                  <div className="bg-[#e9c349]/10 rounded-xl p-2 shrink-0">
                    <span className="material-symbols-outlined text-[#e9c349] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-[#e9c349] tracking-widest uppercase mb-0.5">AI Suggestion</p>
                    <p className="text-[11px] sm:text-xs text-[#bac9cc] leading-normal">
                      Add <span className="text-[#e9c349] italic font-bold">Sparkling Yuzu Soda</span> for ₹6.00
                    </p>
                  </div>
                  <button
                    onClick={() => setAiAdded(true)}
                    className="bg-[#e9c349]/10 hover:bg-[#e9c349]/20 border border-[#e9c349]/30 text-[#e9c349] px-4 py-1.5 rounded-xl text-xs font-black transition-all shrink-0"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="lume-glass bg-[#201f20]/60 rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 shadow-2xl border border-[#3b494c]/15">
              <h2 className="text-lg font-manrope font-black text-[#e5e2e3] mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#bac9cc]">Subtotal</span>
                  <span className="font-bold font-manrope text-[#e5e2e3]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#bac9cc]">Platform Fee</span>
                  <span className="font-bold font-manrope text-[#e5e2e3]">₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#bac9cc]">Tax & Fees</span>
                  <span className="font-bold font-manrope text-[#e5e2e3]">₹{tax}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#3b494c]/20 mb-6 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-[#bac9cc] uppercase tracking-widest font-black block mb-1">Estimated Total</span>
                  <span className="text-4xl font-manrope font-black tracking-tighter text-[#00e5ff] leading-none">
                    ₹{total}
                  </span>
                </div>
                <div className="bg-[#e9c349]/10 border border-[#e9c349]/20 rounded-xl px-3 py-1.5 self-center">
                  <span className="text-[#e9c349] font-black text-xs">+{pts} pts</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] text-[#bac9cc] uppercase tracking-widest font-black mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">edit_note</span>
                  Special Instructions
                </h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add kitchen notes or allergy alerts..."
                  className="w-full bg-[#0e0e0f] border border-[#3b494c]/30 rounded-2xl p-4 text-xs text-[#e5e2e3] focus:border-[#00e5ff]/50 outline-none transition-all resize-none h-20 placeholder:text-[#3b494c]/70"
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="w-full bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#00363d] py-4 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(0,229,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPlacing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#00363d]/30 border-t-[#00363d] rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <span className="material-symbols-outlined text-[20px] font-black">arrow_forward</span>
                  </>
                )}
              </button>

              <p className="text-center text-[9px] text-[#bac9cc]/50 mt-4 leading-relaxed">
                Secured by enterprise encryption. You agree to LUME's terms.
              </p>
            </div>

            {/* Security Badges */}
            <div className="flex justify-center gap-8 mt-6 opacity-30 invert">
              <span className="material-symbols-outlined">verified_user</span>
              <span className="material-symbols-outlined">credit_card</span>
              <span className="material-symbols-outlined">lock</span>
            </div>
          </>
        )}
      </main>

      {/* ── Mobile Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#131314]/90 backdrop-blur-2xl border-t border-[#3b494c]/15 h-20 px-4 flex justify-around items-center pb-[env(safe-area-inset-bottom)]">
        <Link to="/customer" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60">
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px] font-medium tracking-wide mt-0.5">Home</span>
        </Link>
        <Link to="/customer/menu" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60">
          <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
          <span className="text-[10px] font-medium tracking-wide mt-0.5">Menu</span>
        </Link>
        <Link to="/customer/ai" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60 group">
          <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">auto_awesome</span>
          <span className="text-[10px] font-bold mt-0.5">AI</span>
        </Link>
        <div className="flex flex-col items-center justify-center text-[#00e5ff] bg-[#c3f5ff]/10 rounded-2xl px-4 py-1.5 transition-all shadow-[0_0_20px_rgba(0,229,255,0.1)]">
          <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
          <span className="text-[10px] font-medium tracking-wide mt-0.5">Cart</span>
        </div>
      </nav>

    </div>
  );
}
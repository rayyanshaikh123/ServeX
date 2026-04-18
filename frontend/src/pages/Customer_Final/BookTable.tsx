import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRestaurantContext } from "../../hooks/useRestaurantContext";
import { API_BASE_URL } from "../../lib/api";
import { toast } from "sonner";

const slots = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const bars = [40, 60, 85, 100, 75, 50, 35];

export default function BookTablePage() {
  const { restaurantId, tableId } = useRestaurantContext();
  const navigate = useNavigate();

  const [guests, setGuests] = useState(4);
  const [selectedSlot, setSelectedSlot] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleGuests = (delta: number) => {
    setGuests((prev) => Math.min(10, Math.max(1, prev + delta)));
  };

  // ── Confirm Booking ──────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!guestName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!restaurantId) {
      toast.error("No restaurant context — please scan the QR code again.");
      return;
    }

    // Build ISO start_time from selected date + time slot
    const [hours, minutes] = slots[selectedSlot].split(":").map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);

    setIsBooking(true);
    try {
      const payload = {
        table_id: tableId || null,
        guest_name: guestName.trim(),
        party_size: guests,
        start_time: startTime.toISOString(),
        duration_minutes: 90,
        notes: null,
      };

      const res = await fetch(`${API_BASE_URL}/api/bookings/public/${restaurantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).detail ?? "Failed to create booking");
      }

      setBooked(true);
      toast.success("Booking confirmed! See you soon 🎉");
    } catch (err: any) {
      toast.error(err.message ?? "Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // ── Success Screen ───────────────────────────────────────────────────────
  if (booked) {
    return (
      <div className="lume-bg lume-text font-inter min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c3f5ff] to-[#00e5ff] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(0,229,255,0.3)]">
            <span className="material-symbols-outlined text-5xl text-[#00363d]">event_available</span>
          </div>
          <h1 className="text-3xl font-manrope font-black text-[#e5e2e3] mb-3">You're Confirmed!</h1>
          <p className="text-[#bac9cc] mb-2">
            <span className="text-[#c3f5ff] font-bold">{guestName}</span> · {guests} guests
          </p>
          <p className="text-[#bac9cc] text-sm mb-10">
            {new Date(date).toDateString()} at {slots[selectedSlot]}
          </p>
          <Link
            to="/customer"
            className="bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#00363d] px-8 py-4 rounded-2xl font-black text-base inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lume-bg lume-text font-inter min-h-screen selection:bg-[#c3f5ff]/20 selection:text-[#c3f5ff] flex flex-col">

      {/* ── Top Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-xl border-b border-[#3b494c]/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/customer" className="p-2 bg-[#c3f5ff]/10 rounded-full text-[#c3f5ff] hover:bg-[#c3f5ff]/20 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] font-manrope uppercase">
              LUME
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/customer" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Home</Link>
            <Link to="/customer/book" className="text-[#00e5ff] font-medium border-b-2 border-[#00e5ff] px-3 py-2 text-sm">Reserve</Link>
            <Link to="/customer/menu" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Menu</Link>
            <Link to="/customer/ai" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">AI Assistant</Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2a2a2b] flex items-center justify-center border border-[#3b494c]/30">
              <span className="material-symbols-outlined text-[#bac9cc] text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 pt-24 pb-32 px-4 max-w-lg mx-auto w-full">

        {/* Hero Title */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-manrope font-black tracking-tight mb-2">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff]">Experience</span>
          </h1>
          <p className="text-sm text-[#bac9cc] font-medium leading-relaxed">
            Real-time dining intelligence & predictive peak-flow management.
          </p>
        </div>

        {/* Guest Name */}
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-[10px] font-black tracking-[0.2em] text-[#849396] uppercase mb-4 font-inter">Your Name</h2>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name for the reservation"
            className="w-full bg-[#1c1b1c] border border-[#3b494c]/20 hover:border-[#00e5ff]/40 focus:border-[#00e5ff]/60 transition-all rounded-2xl p-4 text-sm text-[#e5e2e3] placeholder:text-[#3b494c]/70 outline-none"
          />
        </section>

        {/* Date & Guests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div>
            <h2 className="text-[10px] font-black tracking-[0.2em] text-[#849396] uppercase mb-4 font-inter">Target Date</h2>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#1c1b1c] border border-[#3b494c]/20 hover:border-[#00e5ff]/40 transition-all rounded-2xl p-4 text-sm text-[#e5e2e3] outline-none focus:border-[#00e5ff]/60"
            />
          </div>
          <div>
            <h2 className="text-[10px] font-black tracking-[0.2em] text-[#849396] uppercase mb-4 font-inter">Guest Count</h2>
            <div className="bg-[#1c1b1c] border border-[#3b494c]/20 rounded-2xl p-3 flex items-center justify-between">
              <button
                onClick={() => handleGuests(-1)}
                className="w-10 h-10 rounded-xl bg-[#2a2a2b] flex items-center justify-center text-[#c3f5ff] hover:bg-[#c3f5ff] hover:text-[#00363d] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="text-lg font-black text-[#e5e2e3] w-8 text-center">{guests}</span>
              <button
                onClick={() => handleGuests(1)}
                className="w-10 h-10 rounded-xl bg-[#2a2a2b] flex items-center justify-center text-[#c3f5ff] hover:bg-[#c3f5ff] hover:text-[#00363d] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h2 className="text-[10px] font-black tracking-[0.2em] text-[#849396] uppercase mb-4 font-inter">Available Windows</h2>
          <div className="grid grid-cols-3 gap-3">
            {slots.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSlot(i)}
                className={`py-3.5 rounded-2xl text-xs font-black transition-all active:scale-95 border ${
                  selectedSlot === i
                    ? "bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#001f24] border-transparent shadow-[0_5px_15px_rgba(0,229,255,0.2)]"
                    : "bg-[#1c1b1c] text-[#bac9cc] border-[#3b494c]/20 hover:border-[#c3f5ff]/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* AI Prediction Hub */}
        <div className="bg-[#201f20] rounded-[2.5rem] p-7 border border-[#3b494c]/20 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-6xl">insights</span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-[#00e5ff]/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00e5ff] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
            </div>
            <span className="text-[10px] font-black tracking-widest text-[#00e5ff] uppercase">AI Prediction Engine</span>
          </div>

          <div className="mb-6">
            <p className="text-[11px] text-[#bac9cc]/60 font-bold uppercase tracking-wider mb-2">Estimated Arrival Wait</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-manrope font-black text-[#e5e2e3]">5–10</span>
              <span className="text-sm text-[#849396] font-bold">minutes</span>
            </div>
          </div>

          <div className="bg-[#e9c349]/10 border-l-4 border-[#e9c349] rounded-r-2xl p-4 mb-6">
            <p className="text-xs text-[#bac9cc] leading-relaxed">
              <span className="text-[#e9c349] font-black">Smart Insight:</span> Your selected slot ({slots[selectedSlot]}) is
              <span className="text-white font-bold"> 40% quieter</span> than our daily peak. Optimal for focused dining.
            </p>
          </div>

          {/* Chart Mock */}
          <div className="flex items-end gap-1.5 h-16 mb-4">
            {bars.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-lg transition-all duration-700 ${i === selectedSlot % bars.length ? "bg-[#00e5ff]" : "bg-[#c3f5ff]/10"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] font-bold text-[#849396] tracking-tighter uppercase">
            <span>18:00</span>
            <span>19:30</span>
            <span>21:00</span>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <button
            onClick={handleConfirm}
            disabled={isBooking}
            className="w-full bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#00363d] py-5 rounded-[2rem] font-black text-lg shadow-[0_15px_35px_rgba(0,229,255,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBooking ? (
              <>
                <div className="w-5 h-5 border-2 border-[#00363d]/30 border-t-[#00363d] rounded-full animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                Confirm Intelligence Booking
                <span className="material-symbols-outlined text-[20px] font-black group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-[#bac9cc]/40 mt-4 leading-relaxed px-10">
            By confirming, our AI seating engine will prioritize your placement based on current and predicted flow.
          </p>
        </div>

      </main>

      {/* ── Mobile Nav Pad ── */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#131314]/90 backdrop-blur-2xl border-t border-[#3b494c]/15 h-20 px-4 flex justify-around items-center pb-[env(safe-area-inset-bottom)]">
        <Link to="/customer" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60 group">
          <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">home</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link to="/customer/menu" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60 group">
          <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">restaurant_menu</span>
          <span className="text-[10px] font-bold mt-0.5">Menu</span>
        </Link>
        <div className="flex flex-col items-center justify-center text-[#00e5ff] bg-[#c3f5ff]/10 rounded-2xl px-5 py-1.5 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
          <span className="material-symbols-outlined text-[22px]">event</span>
          <span className="text-[10px] font-bold mt-0.5">Reserve</span>
        </div>
        <Link to="/customer/cart" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60 group">
          <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">shopping_cart</span>
          <span className="text-[10px] font-bold mt-0.5">Orders</span>
        </Link>
      </nav>

    </div>
  );
}
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useRestaurantContext } from "../../hooks/useRestaurantContext";
import { API_BASE_URL } from "../../lib/api";
import { useVoiceRecognition } from "../../hooks/useVoiceRecognition";

const CHIPS = ["Suggest something spicy", "Best dish under ₹300", "Any nut-free options?", "Wine pairing ideas"];

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
}

export default function AIPage() {
  const { restaurantId } = useRestaurantContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "Welcome to LUME! I'm your AI dining concierge powered by our live menu. I can help recommend dishes, check allergens, suggest pairings, or answer any questions. What would you like to know?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [interimText, setInterimText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Unique session ID so the backend can maintain conversation memory
  const sessionId = useRef(`lume-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // ── Voice recognition ───────────────────────────────────────────────────
  const handleVoiceResult = useCallback((text: string) => {
    if (text === "__unrecognized__") {
      // No speech detected — just reset, same as listener.py WaitTimeoutError
      return;
    }
    if (text.startsWith("__error__")) {
      // API / hardware error
      console.warn("Voice recognition error:", text);
      return;
    }
    // Final text → populate input box so user can review / edit before sending
    setInterimText("");
    setInputVal(text);
  }, []);

  const handleInterim = useCallback((partial: string) => {
    setInterimText(partial);
  }, []);

  const { status: voiceStatus, isListening, toggle: toggleVoice, isSupported: voiceSupported } =
    useVoiceRecognition({ onResult: handleVoiceResult, onInterim: handleInterim });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // ── Send message via backend RAG pipeline ───────────────────────────────
  const sendMessage = async (text?: string) => {
    const msg = (text || inputVal).trim();
    if (!msg || isLoading) return;
    setInputVal("");

    const userMsg: Message = { id: Date.now(), role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const aiId = Date.now() + 1;
    // Add an empty AI message that we'll stream into
    setMessages((prev) => [...prev, { id: aiId, role: "ai", text: "" }]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: msg,
          session_id: sessionId.current,
          restaurant_id: restaurantId || undefined,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Chat request failed");

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        // Update the AI message incrementally
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, text: accumulated } : m))
        );
      }

      if (!accumulated) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? { ...m, text: "I apologize, I'm having trouble responding right now. Please try again." }
              : m
          )
        );
      }
    } catch (error: any) {
      console.error("LUME AI ERROR:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? {
                ...m,
                text: "I'm experiencing a brief connection issue. Please try again in a moment.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lume-bg lume-text font-inter min-h-screen flex flex-col selection:bg-[#c3f5ff]/20 selection:text-[#c3f5ff]">

      {/* ── Top Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-[#131314]/80 backdrop-blur-xl border-b border-[#3b494c]/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 w-full max-w-7xl mx-auto">
          {/* Logo & Back */}
          <div className="flex items-center gap-3">
            <Link to="/customer" className="p-2 bg-[#c3f5ff]/10 rounded-full text-[#c3f5ff] hover:bg-[#c3f5ff]/20 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-manrope font-black text-[#c3f5ff]">LUME CONCIERGE</span>
              <span className="text-[10px] font-bold text-[#bac9cc]/60 uppercase tracking-widest leading-none">Powered by ServeX RAG</span>
            </div>
            <span className="block sm:hidden text-xl font-black tracking-tighter text-[#c3f5ff] font-manrope">LUME</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/customer" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Home</Link>
            <Link to="/customer/book" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Reserve</Link>
            <Link to="/customer/menu" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Menu</Link>
            <Link to="/customer/ai" className="text-[#00e5ff] font-medium border-b-2 border-[#00e5ff] px-3 py-2 text-sm">AI Assistant</Link>
            <Link to="/customer/cart" className="text-[#bac9cc] hover:bg-[#c3f5ff]/10 transition-colors px-3 py-2 rounded-lg font-medium text-sm">Cart</Link>
          </div>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c3f5ff] to-[#00e5ff] p-[1px] shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0">
            <div className="w-full h-full rounded-full bg-[#131314] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00e5ff] text-[20px]">auto_awesome</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Chat Content ── */}
      <main
        ref={scrollRef}
        className="flex-1 pt-20 pb-44 px-4 max-w-2xl mx-auto w-full overflow-y-auto no-scrollbar"
      >
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 ${
                  msg.role === "user"
                    ? "bg-[#353436] rounded-tr-sm border border-[#3b494c]/20"
                    : "bg-[#1c1b1c] rounded-tl-sm border border-[#3b494c]/15 shadow-xl"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                  </div>
                )}
                <p className="text-sm sm:text-base leading-relaxed text-[#bac9cc] whitespace-pre-wrap">
                  {msg.text || (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#c3f5ff]/40 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#c3f5ff]/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#c3f5ff]/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "ai" && (
            <div className="flex justify-start">
              <div className="bg-[#1c1b1c] rounded-3xl rounded-tl-sm p-4 flex gap-1.5 items-center border border-[#3b494c]/15">
                <div className="w-1.5 h-1.5 bg-[#c3f5ff]/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#c3f5ff]/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-[#c3f5ff]/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Fixed Bottom Actions ── */}
      <div className="fixed bottom-0 w-full z-50 bg-[#131314]/90 backdrop-blur-2xl border-t border-[#3b494c]/15">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-[env(safe-area-inset-bottom)]">

          {/* Suggested Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                disabled={isLoading}
                className="px-4 py-2 bg-[#1c1b1c] border border-[#3b494c]/20 rounded-full text-[11px] font-bold text-[#bac9cc] whitespace-nowrap hover:bg-[#c3f5ff]/10 hover:text-[#c3f5ff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                value={isListening ? interimText : inputVal}
                onChange={(e) => {
                  if (!isListening) setInputVal(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && !isListening && sendMessage()}
                placeholder={isListening ? "Listening… speak now" : "Ask LUME anything..."}
                disabled={isLoading}
                readOnly={isListening}
                className={`w-full bg-[#0e0e0f] border rounded-2xl py-4 pl-5 pr-12 text-sm outline-none transition-all disabled:opacity-50 ${
                  isListening
                    ? "border-[#00e5ff]/70 text-[#bac9cc]/60 placeholder:text-[#00e5ff]/50"
                    : voiceStatus === "error"
                    ? "border-red-500/50 text-[#e5e2e3] placeholder:text-[#3b494c]/70"
                    : "border-[#3b494c]/30 text-[#e5e2e3] focus:border-[#00e5ff]/50 placeholder:text-[#3b494c]/70"
                }`}
              />
              {/* Mic toggle button */}
              {voiceSupported && (
                <button
                  onClick={toggleVoice}
                  disabled={isLoading}
                  title={isListening ? "Stop listening" : "Speak to LUME"}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all ${
                    isListening
                      ? "text-[#00e5ff] opacity-100"
                      : voiceStatus === "error"
                      ? "text-red-400 opacity-80"
                      : "text-[#00e5ff] opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* Pulsing ring when listening */}
                  {isListening && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-8 h-8 rounded-full border-2 border-[#00e5ff]/50 animate-ping absolute" />
                    </span>
                  )}
                  <span className="material-symbols-outlined text-[20px] relative z-10">
                    {isListening ? "mic" : voiceStatus === "error" ? "mic_off" : "mic"}
                  </span>
                </button>
              )}
              {/* Fallback static mic when unsupported */}
              {!voiceSupported && (
                <span
                  title="Voice input not supported in this browser"
                  className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-[#3b494c]/30 cursor-not-allowed"
                >
                  mic_off
                </span>
              )}
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={isLoading}
              className="w-14 h-14 bg-gradient-to-r from-[#c3f5ff] to-[#00e5ff] text-[#00363d] rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[24px]">send</span>
            </button>
          </div>

          {/* Model Badge */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[9px] text-[#bac9cc]/30 font-bold uppercase tracking-widest">Powered by ServeX RAG · Gemini</span>
          </div>

          {/* Navigation */}
          <nav className="flex justify-around items-center h-16 border-t border-[#3b494c]/10">
            <Link to="/customer" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60 group">
              <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">home</span>
              <span className="text-[10px] font-bold mt-0.5">Home</span>
            </Link>
            <Link to="/customer/menu" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60 group">
              <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">restaurant_menu</span>
              <span className="text-[10px] font-bold mt-0.5">Menu</span>
            </Link>
            <div className="flex flex-col items-center justify-center text-[#00e5ff] bg-[#c3f5ff]/10 rounded-2xl px-5 py-1.5 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              <span className="text-[10px] font-bold mt-0.5">AI</span>
            </div>
            <Link to="/customer/cart" className="flex flex-col items-center justify-center text-[#bac9cc] opacity-60 group">
              <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">shopping_cart</span>
              <span className="text-[10px] font-bold mt-0.5">Orders</span>
            </Link>
          </nav>
        </div>
      </div>

    </div>
  );
}
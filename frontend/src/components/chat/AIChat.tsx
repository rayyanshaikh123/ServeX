import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Loader2, Leaf, Flame, ChefHat, Info, Home, UtensilsCrossed, ShoppingCart, User } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useCartStore } from '../../store/useCartStore';
import { toast } from 'sonner';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { useCallback } from 'react';

interface MenuCard {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  spiceLevel: string;
  tags: string[];
  score: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  menuItems?: MenuCard[];
}

interface AIChatProps {
  variant?: 'widget' | 'page';
  guestRestaurantId?: string;
}

function getItemGradient(name: string): string {
  const gradients = [
    'from-amber-900/80 via-orange-900/60 to-zinc-950',
    'from-emerald-900/80 via-teal-900/60 to-zinc-950',
    'from-rose-900/80 via-pink-900/60 to-zinc-950',
    'from-violet-900/80 via-purple-900/60 to-zinc-950',
    'from-sky-900/80 via-cyan-900/60 to-zinc-950',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

function getSpiceIcon(level: string) {
  const l = level?.toLowerCase();
  if (l === 'high' || l === 'hot') return <Flame className="w-3 h-3 text-red-400" />;
  if (l === 'medium') return <Flame className="w-3 h-3 text-orange-400" />;
  return <Flame className="w-3 h-3 text-yellow-400" />;
}

function MenuItemCard({ item, onAdd }: { item: MenuCard, onAdd: (item: MenuCard) => void }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm shadow-xl group hover:border-primary/30 transition-all duration-300">
      <div className={cn(
        "h-32 bg-gradient-to-br flex items-end p-4 relative overflow-hidden",
        getItemGradient(item.name)
      )}>
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/5">
          <ChefHat className="w-5 h-5 text-white/80" />
        </div>
        <div className="absolute top-4 left-4">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border",
            item.isVeg
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.isVeg ? "bg-emerald-400" : "bg-red-400")} />
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </div>
        </div>
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          <span className="text-white font-bold text-sm tracking-tight text-shadow-sm">₹{item.price}</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h4 className="font-bold text-base text-zinc-100 leading-tight tracking-tight">{item.name}</h4>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-0.5 rounded-md border border-zinc-700/50">
            {getSpiceIcon(item.spiceLevel)}
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{item.spiceLevel || 'Mild'}</span>
          </div>
          {item.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-[10px] uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold tracking-widest border border-primary/20">{tag}</span>
          ))}
        </div>
      </div>
      <Button
        onClick={() => onAdd(item)}
        className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 text-sm py-2 rounded-xl"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add to Cart
      </Button>
    </div>
  );
}

function parseMenuItems(text: string): { cleanText: string; menuItems: MenuCard[] } {
  const match = text.match(/__MENU_ITEMS__(.*?)__END_MENU_ITEMS__/s);
  if (!match) return { cleanText: text, menuItems: [] };
  try {
    const items = JSON.parse(match[1]) as MenuCard[];
    const cleanText = text.replace(/__MENU_ITEMS__.*?__END_MENU_ITEMS__\n?/s, '').trim();
    return { cleanText, menuItems: items };
  } catch {
    return { cleanText: text, menuItems: [] };
  }
}

export const AIChat = ({ variant = 'widget', guestRestaurantId }: AIChatProps) => {
  const [isOpen, setIsOpen] = useState(variant === 'page');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "What's on your mind tonight?\n\nI can help you discover dishes, find something specific, or recommend based on your taste." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, activeRestaurantId } = useAuthStore();
  const cart = useCartStore();
  const isPage = variant === 'page';
  const [interimText, setInterimText] = useState("");

  // ── Voice recognition ───────────────────────────────────────────────────
  const handleVoiceResult = useCallback((text: string) => {
    if (text === "__unrecognized__") return;
    if (text.startsWith("__error__")) {
      console.warn("Voice error:", text);
      return;
    }
    setInterimText("");
    setInput(text);
  }, []);

  const handleInterim = useCallback((partial: string) => {
    setInterimText(partial);
  }, []);

  const { status: voiceStatus, isListening, toggle: toggleVoice, isSupported: voiceSupported } =
    useVoiceRecognition({ onResult: handleVoiceResult, onInterim: handleInterim });

  const handleAddToCart = (item: MenuCard) => {
    cart.addItem({
      ...item,
      category: 'Recommended',
      stock: 10,
      low_stock_threshold: 5,
      time_to_cook: 0,
      restaurant_id: activeRestaurantId || guestRestaurantId || ''
    } as any);
    toast.success(`Added ${item.name} to cart`);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          query: userMessage,
          session_id: 'default-session',
          restaurant_id: activeRestaurantId || guestRestaurantId
        })
      });

      if (!res.ok) throw new Error('API request failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Stream failed');

      setMessages(prev => [...prev, { role: 'assistant', content: '', menuItems: [] }]);
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let { cleanText, menuItems } = parseMenuItems(textBuffer);

        // Fix Qwen's tendency to escape bold tags and use spaces that trigger markdown code blocks
        cleanText = cleanText.replace(/\\\*/g, '*').replace(/^[ \t]+/gm, '');

        setMessages(prev => {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1] = {
            ...newMsg[newMsg.length - 1],
            content: cleanText,
            menuItems: menuItems.length > 0 ? menuItems : newMsg[newMsg.length - 1].menuItems,
          };
          return newMsg;
        });
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.content === '') {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1].content = '**Connection error.** I seem to be having trouble reaching the kitchen brains. Please try again in a moment.';
          return newMsg;
        }
        return [...prev, { role: 'assistant', content: '**Connection error.** Please try again.' }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !isPage) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center p-0 z-50 transition-all hover:scale-110 active:scale-95 border border-white/20"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "flex flex-col shadow-2xl border-zinc-800 bg-zinc-950 rounded-[32px] overflow-hidden relative border-t-[0.5px] border-zinc-700/50",
        isPage
          ? "w-full max-w-2xl h-[85vh] mx-auto"
          : "fixed bottom-8 right-8 w-[400px] h-[680px] z-50 transform animate-in slide-in-from-bottom-8 duration-500 ease-out"
      )}
    >
      {/* Top Header */}
      <div className="px-6 py-5 flex items-center justify-between shrink-0 bg-zinc-950/80 backdrop-blur-md relative z-10 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              ServeX AI
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </h2>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black opacity-80">Intelligence Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPage && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-hidden bg-zinc-950 relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

        <ScrollArea className="h-full">
          <div className="px-6 py-8 space-y-8">
            {messages.map((m, i) => (
              <div key={i} className="space-y-4">
                {/* Assistant Label */}
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">AI Intelligence</span>
                  </div>
                )}

                <div className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "rounded-2xl text-[14px] leading-relaxed",
                    m.role === 'assistant'
                      ? "text-zinc-300 font-sans max-w-[95%]"
                      : "bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-medium px-5 py-3 rounded-br-sm shadow-xl max-w-[85%]"
                  )}>
                    {m.role === 'assistant' && i === 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-zinc-100 tracking-tight leading-tight">What's on your<br />mind tonight?</h3>
                        <p className="text-zinc-500 text-sm font-medium leading-normal">I can help you discover dishes, find something specific, or recommend based on your taste.</p>
                      </div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0 whitespace-pre-wrap">{children}</p>,
                          strong: ({ children }) => (
                            <strong className="font-bold text-primary tracking-tight">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-3 space-y-1.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 space-y-1.5">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>

                {/* Menu Item Cards */}
                {m.menuItems && m.menuItems.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    {m.menuItems.map((item, idx) => (
                      <MenuItemCard key={idx} item={item} onAdd={handleAddToCart} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">AI Intelligence</span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/50 px-5 py-3 rounded-2xl flex items-center gap-3 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-[12px] text-zinc-400 font-bold uppercase tracking-widest">Studying Menu...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* Input Section */}
      <div className="px-6 py-6 border-t border-zinc-800/50 bg-zinc-950 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative group/form"
        >
          <Input
            placeholder={isListening ? "Listening..." : "Ask anything about our menu..."}
            value={isListening ? interimText : input}
            onChange={(e) => {
              if (!isListening) setInput(e.target.value);
            }}
            readOnly={isListening}
            disabled={isLoading}
            className={cn(
              "w-full bg-zinc-900/80 border-zinc-800/80 h-14 pl-5 pr-24 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-primary/40 focus-visible:ring-offset-0 rounded-[20px] shadow-inner transition-all border-t border-white/5",
              isListening && "border-primary/50 ring-1 ring-primary/20",
              voiceStatus === 'error' && "border-red-500/50"
            )}
          />
          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            {voiceSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleVoice}
                disabled={isLoading}
                className={cn(
                  "h-10 w-10 rounded-2xl transition-all relative",
                  isListening 
                    ? "text-primary bg-primary/10" 
                    : voiceStatus === 'error'
                    ? "text-red-400 bg-red-400/10"
                    : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
                )}
              >
                {isListening && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-8 h-8 rounded-full border border-primary/40 animate-ping" />
                  </span>
                )}
                {isListening ? <Sparkles className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || isListening}
              className="bg-primary hover:bg-primary/90 h-10 w-10 shrink-0 rounded-2xl shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
            >
              <Send className="h-4.5 w-4.5" />
            </Button>
          </div>
        </form>
      </div>

    </Card>
  );
};

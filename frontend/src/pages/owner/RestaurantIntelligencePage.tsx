import { useState, useRef, useEffect, useCallback } from "react";
import { useVoiceRecognition } from "../../hooks/useVoiceRecognition";
import { Card, CardContent } from "../../components/ui/card";
import { Sparkles, BrainCircuit, MessageSquare, Send, Database, BarChart3, Fingerprint, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { GoogleGenAI } from "@google/genai";
import { cn } from "../../lib/utils";

// Mock implementation of restaurant knowledge base for "RAG" feeding
const restaurantContext = `
RESTAURANT_ID: NODE-001 (ServeX Executive Lounge)
GEOMETRY: 123 Financial District
CORE_ANALYTICS:
- Gross Yield: $1.2M (Projected Annual)
- Current Conversion: 32.4%
- Top Performance Peak: 19:00 - 21:00 Friday
- Inventory Health: 92% (Truffle items critically low)
- Service Efficiency Index: 0.88
DIRECTIVES: "Optimize for high-net-worth quick dining. Prioritize VIP terrace reservations."
`;

export const RestaurantIntelligencePage = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Core intelligence synthesized. Awaiting operational inquiries regarding Establishment NODE-001." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interimText, setInterimText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are the ServeX Restaurant Management AI. 
        You have direct access to the following restaurant context (RAG):
        ${restaurantContext}
        
        Using this data, provide strategic, data-driven advice.
        Question: ${userMsg}
        
        Keep responses concise and formatted for a high-end dashboard. Use bold text for metrics.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.text || "Diagnostic error: Knowledge retrieval unavailable." }]);
    } catch (error) {
      console.error("Intelligence error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "System node failure. Re-authenticating RAG pipeline..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-3">
           <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Artificial Intelligence</h1>
           <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-primary/30 bg-primary/5 text-primary">RAG Active</Badge>
        </div>
        <h2 className="text-3xl font-serif italic text-foreground tracking-tight">Restaurant Strategy Node</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 overflow-hidden">
        {/* Analytics Feed / RAG Context */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-4 hidden lg:block">
           <Card className="bg-card border-border shadow-none rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                 <Database className="w-5 h-5 text-primary" />
                 <span className="text-[10px] uppercase tracking-widest font-bold">Knowledge Base Feeding</span>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Yield Analytics', icon: BarChart3, status: 'Synced' },
                   { label: 'Inventory Matrix', icon: Zap, status: 'Synced' },
                   { label: 'Operations Performance', icon: Fingerprint, status: 'Synced' },
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col gap-2 p-3 bg-muted/10 rounded-lg border border-border/50">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[11px] font-medium text-foreground">{item.label}</span>
                         </div>
                         <span className="text-[9px] text-emerald-500 font-bold uppercase">{item.status}</span>
                      </div>
                      <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500/50" style={{ width: '100%' }} />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="bg-card border-border shadow-none rounded-xl p-6 border-l-primary border-l-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 block italic">Neural Insight</span>
              <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                AI has identified a recurring throughput bottleneck at Table 12. Recommend re-assigning <span className="text-foreground font-bold">Priority Service Lead</span> during Peak Friday Block.
              </p>
           </Card>
        </div>

        {/* Intelligence Interface */}
        <Card className="lg:col-span-8 bg-card border-border shadow-none rounded-xl flex flex-col overflow-hidden relative border-t-primary/20">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-24 h-24" />
           </div>

           <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1" ref={scrollRef}>
                 <div className="p-8 space-y-8">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={cn(
                        "flex gap-4",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}>
                         <div className={cn(
                           "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border mt-1",
                           msg.role === 'ai' ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground"
                         )}>
                           {msg.role === 'ai' ? <Sparkles className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                         </div>
                         <div className={cn(
                           "p-6 rounded-2xl max-w-[85%] leading-relaxed text-[14px]",
                           msg.role === 'ai' 
                             ? "bg-muted/20 border border-border text-foreground italic font-serif" 
                             : "bg-primary text-white font-sans"
                         )}>
                            {msg.content}
                         </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-4 animate-pulse">
                         <div className="w-10 h-10 rounded-full bg-muted/30" />
                         <div className="h-16 bg-muted/20 rounded-2xl w-48" />
                      </div>
                    )}
                 </div>
              </ScrollArea>

              <div className="p-8 border-t border-border bg-muted/10">
                  <div className="relative group">
                    <Input 
                      value={isListening ? interimText : input}
                      onChange={(e) => {
                        if (!isListening) setInput(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && !isListening && generateResponse()}
                      placeholder={isListening ? "Listening..." : "Consult the strategy engine regarding operational data..."} 
                      readOnly={isListening}
                      disabled={isLoading}
                      className={cn(
                        "bg-card border-border h-14 pl-6 pr-24 text-sm focus-visible:ring-primary shadow-inner transition-all",
                        isListening && "border-primary/50 ring-1 ring-primary/20",
                        voiceStatus === 'error' && "border-red-500/50"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       {voiceSupported && (
                         <button
                           onClick={toggleVoice}
                           disabled={isLoading}
                           className={cn(
                             "p-2 rounded-lg transition-all relative overflow-hidden",
                             isListening 
                               ? "text-primary bg-primary/10" 
                               : voiceStatus === 'error'
                               ? "text-red-400 bg-red-400/10"
                               : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                           )}
                         >
                            {isListening && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-8 h-8 rounded-full border border-primary/40 animate-ping" />
                              </span>
                            )}
                            <Sparkles className="w-4 h-4" />
                         </button>
                       )}
                       <button 
                         onClick={() => !isListening && generateResponse()}
                         disabled={isLoading || !input.trim() || isListening}
                         className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all opacity-80 group-hover:opacity-100 disabled:opacity-50"
                       >
                          <Send className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                 <div className="flex items-center justify-center gap-6 mt-4">
                    <span className="text-[10px] text-muted-foreground italic tracking-widest">Model: Gemini Strategy Node</span>
                    <span className="text-[10px] text-muted-foreground italic tracking-widest">Context Window: Node-001 Ledger</span>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

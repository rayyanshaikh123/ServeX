import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  variant?: 'widget' | 'page';
  guestRestaurantId?: string;
}

export const AIChat = ({ variant = 'widget', guestRestaurantId }: AIChatProps) => {
  const [isOpen, setIsOpen] = useState(variant === 'page');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am ServeX AI. How can I help you manage your restaurant operations today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, activeRestaurantId } = useAuthStore();
  const isPage = variant === 'page';
  const isWidget = !isPage;

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

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        setMessages(prev => {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1] = { ...newMsg[newMsg.length - 1], content: textBuffer };
          return newMsg;
        });
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.content === '') {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1].content = 'Connection to AI lost. Please check your network or try again.';
          return newMsg;
        }
        return [...prev, { role: 'assistant', content: 'Connection to AI lost. Please check your network or try again.' }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isWidget && !isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-2xl flex items-center justify-center p-0 z-50 transition-transform hover:scale-110 active:scale-95 border border-white/10"
      >
        <MessageSquare className="w-5 h-5 text-white" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "flex flex-col shadow-2xl border-border bg-card rounded-xl overflow-hidden",
        isPage
          ? "w-full max-w-4xl h-[70vh] mx-auto"
          : "fixed bottom-6 right-6 w-96 h-[500px] z-50 transform animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-widest font-bold text-foreground">ServeX Assistant</span>
        </div>
        {isWidget && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <CardContent className="flex-1 p-5 overflow-hidden bg-background">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg text-[13px] leading-relaxed max-w-[85%]",
                  m.role === 'assistant'
                    ? "bg-muted/30 text-foreground border border-border/50 font-sans"
                    : "bg-primary text-white font-medium"
                )}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => (
                        <strong className={cn(
                          "font-bold",
                          m.role === 'assistant' ? "text-primary" : "text-white underline decoration-white/30"
                        )}>
                          {children}
                        </strong>
                      ),
                      ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="mb-0">{children}</li>
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-pulse">
                <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border/50 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest">Processing</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t border-border bg-card shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex w-full items-center gap-2"
        >
          <Input
            placeholder="Ask ServeX anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-background border-border h-10 text-xs focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" disabled={isLoading} className="bg-primary hover:bg-primary/90 h-10 w-10 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

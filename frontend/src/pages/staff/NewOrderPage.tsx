import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Utensils, Search, Plus, Minus, X, Check, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { cn } from "../../lib/utils";

const menuItems = [
  { id: '1', name: 'Wagyu Truffle Burger', price: 34.00, category: 'Mains', description: 'Double wagyu beef with black truffle mayo' },
  { id: '2', name: 'Lobster Ravioli', price: 28.50, category: 'Pasta', description: 'Fresh lobster in brown butter sauce' },
  { id: '3', name: 'Caesar Salad', price: 16.00, category: 'Starters', description: 'Classic caesar with parmesan crisps' },
  { id: '4', name: 'Pinot Noir 2019', price: 12.00, category: 'Wines', description: 'Oregon, Willamette Valley' },
  { id: '5', name: 'Truffle Fries', price: 9.00, category: 'Sides', description: 'Shaved parmesan and parsley' },
  { id: '6', name: 'Filet Mignon', price: 42.00, category: 'Mains', description: '8oz center cut, grass fed' },
];

export const NewOrderPage = () => {
  const [cart, setCart] = useState<{ item: typeof menuItems[0], quantity: number }[]>([]);
  const [category, setCategory] = useState('All');

  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.item.id === id) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const categories = ['All', 'Starters', 'Mains', 'Pasta', 'Wines', 'Sides'];

  const filteredItems = category === 'All' 
    ? menuItems 
    : menuItems.filter(i => i.category === category);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Order Terminal</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Create New Ticket</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Menu Section */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between gap-4">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search menu..." className="bg-card border-border border h-10 pl-10 text-xs focus-visible:ring-primary" />
             </div>
             <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((c) => (
                  <Button
                    key={c}
                    variant={category === c ? 'default' : 'outline'}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "h-8 text-[10px] uppercase tracking-widest font-bold px-4",
                      category === c ? "bg-primary text-white" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c}
                  </Button>
                ))}
             </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="bg-card border-border shadow-none rounded-lg p-5 cursor-pointer hover:border-primary/50 transition-colors flex flex-col"
                  onClick={() => addToCart(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[8px] uppercase tracking-tighter h-4 px-1 border-primary/20 bg-primary/5 text-primary">
                      {item.category}
                    </Badge>
                    <span className="text-[14px] font-mono text-foreground font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <h3 className="text-[14px] font-medium text-foreground mb-1">{item.name}</h3>
                  <p className="text-[11px] text-muted-foreground italic line-clamp-2">{item.description}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Section */}
        <Card className="lg:col-span-4 bg-card border-border shadow-none rounded-lg flex flex-col overflow-hidden h-full">
           <div className="p-5 border-b border-border flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Ticket Summary</span>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
           </div>
           
           <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-5 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                       <Utensils className="w-8 h-8 mb-4 stroke-1" />
                       <span className="text-[11px] uppercase tracking-[0.2em]">Select items to begin</span>
                    </div>
                  ) : (
                    cart.map((line) => (
                      <div key={line.item.id} className="flex justify-between items-center group">
                         <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-medium text-foreground">{line.item.name}</span>
                            <span className="text-[11px] font-mono text-muted-foreground italic">
                               {line.quantity} × ${line.item.price.toFixed(2)}
                            </span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="flex items-center bg-muted/30 rounded-md border border-border">
                               <button 
                                 onClick={() => updateQuantity(line.item.id, -1)}
                                 className="p-1 hover:text-primary transition-colors"
                               >
                                 <Minus className="w-3 h-3" />
                               </button>
                               <span className="w-6 text-center text-[11px] font-mono font-bold">{line.quantity}</span>
                               <button 
                                 onClick={() => updateQuantity(line.item.id, 1)}
                                 className="p-1 hover:text-primary transition-colors"
                               >
                                 <Plus className="w-3 h-3" />
                               </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(line.item.id)}
                              className="text-muted-foreground hover:text-destructive p-1"
                            >
                               <X className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
           </CardContent>

           <div className="p-6 bg-muted/10 border-t border-border space-y-4">
              <div className="space-y-2">
                 <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Tax (10%)</span>
                    <span className="font-mono">${tax.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-lg font-serif italic text-foreground pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span className="font-sans font-bold not-italic font-mono">${total.toFixed(2)}</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" className="border-border text-[10px] uppercase font-bold tracking-widest h-11" disabled={cart.length === 0}>
                   Save Hold
                 </Button>
                 <Button className="bg-primary hover:bg-primary/90 text-white text-[10px] uppercase font-bold tracking-widest h-11" disabled={cart.length === 0}>
                   <Check className="w-4 h-4 mr-2" />
                   Push Ticket
                 </Button>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};

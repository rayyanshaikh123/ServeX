import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingBag, 
  ChevronRight, 
  MessageSquare, 
  Plus, 
  Minus, 
  Utensils,
  Leaf,
  Flame,
  Clock,
  X,
  ArrowRight
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useOrderStore } from '../../store/useOrderStore';
import { MenuItem, Order } from '../../types';
import { AIChat } from '../../components/chat/AIChat';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '../../components/ui/sheet';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../lib/api';

export const GuestMenu = () => {
  const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
  const navigate = useNavigate();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cart = useCartStore();
  const orderStore = useOrderStore();

  useEffect(() => {
    if (restaurantId) {
      cart.setRestaurantId(restaurantId);
      cart.setTableId(tableId || null);
      fetchMenu();
    }
  }, [restaurantId]);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/${restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch menu');
      const data = await response.json();
      setMenuItems(data.items);
      const cats = ['All', ...new Set(data.items.map((item: any) => item.category))] as string[];
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load menu:', error);
      toast.error('Failed to load menu');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/orders/public/${restaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: tableId,
          items: cart.items.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            instructions: item.instructions
          }))
        })
      });
      
      if (!response.ok) throw new Error('Failed to place order');
      
      const order: Order = await response.json();
      orderStore.setActiveOrder(order);
      cart.clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-status/${order.id}`);
    } catch (error) {
      toast.error('Error placing order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Utensils className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">ServeX Digital</h1>
              <p className="text-xs text-zinc-500 mt-1">Table {tableId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAiOpen(true)}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center relative hover:bg-zinc-800 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-zinc-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse border-2 border-zinc-950"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search for dishes..." 
            className="pl-10 h-12 bg-zinc-900/50 border-zinc-800 focus:border-primary transition-all rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-zinc-900/40 border-zinc-800/50 overflow-hidden group hover:border-zinc-700 transition-all">
                  <div className="flex p-3 gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {item.isVeg ? (
                            <Leaf className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Flame className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <h3 className="font-semibold text-zinc-100">{item.name}</h3>
                        </div>
                        <span className="font-bold text-primary">₹{item.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.time_to_cook || 15} mins prep</span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                         <div className="flex gap-1">
                            {item.tags?.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px] bg-zinc-800/50 text-zinc-400 border-none font-normal">
                                {tag}
                              </Badge>
                            ))}
                         </div>
                         <Button 
                            size="sm" 
                            className="h-8 rounded-lg"
                            onClick={() => {
                              cart.addItem(item);
                              toast.info(`Added ${item.name} to cart`);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.items.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-0 right-0 z-50 px-4"
          >
            <Sheet>
              <SheetTrigger
                render={
                  <Button className="w-full max-w-md mx-auto h-16 rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-between px-6 bg-primary hover:bg-primary/90">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm opacity-90 font-medium">{cart.getTotalItems()} Items</p>
                        <p className="font-bold text-lg leading-none">View Cart</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 py-1.5 px-3 rounded-lg">
                      <span className="font-bold">₹{cart.getTotal()}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Button>
                }
              />
              <SheetContent side="bottom" className="h-[85vh] rounded-t-[2.5rem] bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
                <div className="h-full flex flex-col">
                  <SheetHeader className="p-6 border-b border-zinc-900">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" /> Your Cart
                      </SheetTitle>
                    </div>
                  </SheetHeader>
                  
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-zinc-500">₹{item.price} each</p>
                            <Input 
                              placeholder="Add instructions (e.g. less spicy)..." 
                              className="h-8 text-xs bg-zinc-900/50 border-zinc-800 mt-2"
                              value={item.instructions || ''}
                              onChange={(e) => cart.updateInstructions(item.id, e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                              <button 
                                onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:text-primary transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:text-primary transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="font-bold">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-6 bg-zinc-900/40 border-t border-zinc-900 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-zinc-400 text-sm">
                        <span>Subtotal</span>
                        <span>₹{cart.getSubtotal()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400 text-sm">
                        <span>GST (5%)</span>
                        <span>₹{cart.getTax()}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold pt-2 border-t border-zinc-800">
                        <span>Total</span>
                        <span>₹{cart.getTotal()}</span>
                      </div>
                    </div>
                    <Button onClick={handlePlaceOrder} className="w-full h-14 rounded-xl text-lg font-bold">
                      Place Order <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Drawer */}
      <Sheet open={isAiOpen} onOpenChange={setIsAiOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-[2.5rem] bg-zinc-950 border-zinc-800 p-0">
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">ServeX AI</h2>
                  <p className="text-xs text-blue-400">Online | Fast response</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiOpen(false)}
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 overflow-hidden">
              <AIChat guestRestaurantId={restaurantId} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

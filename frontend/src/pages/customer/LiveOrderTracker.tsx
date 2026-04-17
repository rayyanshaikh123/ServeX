import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Utensils, 
  MessageSquare, 
  ArrowLeft,
  Search,
  Check,
  Receipt
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { Order } from '../../types';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Badge } from '../../components/ui/badge';

const STAGES = [
  { id: 'pending', label: 'Ordered', icon: Clock, color: 'text-zinc-500' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-500' },
  { id: 'preparing', label: 'Cooking', icon: ChefHat, color: 'text-orange-500' },
  { id: 'ready', label: 'Ready', icon: Check, color: 'text-green-500' },
  { id: 'served', label: 'Served', icon: Utensils, color: 'text-primary' },
];

export const LiveOrderTracker = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { activeOrder, setActiveOrder, connect, disconnect } = useOrderStore();
  const [isLoading, setIsLoading] = useState(!activeOrder);

  useEffect(() => {
    if (orderId && (!activeOrder || activeOrder.id !== orderId)) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setActiveOrder(data);
        connect(data.restaurant_id);
      }
    } catch (error) {
      console.error('Failed to fetch order');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStageIndex = activeOrder 
    ? STAGES.findIndex(s => s.id === activeOrder.status)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800">
          <Search className="w-10 h-10 text-zinc-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-zinc-500 mb-8">We couldn't find the order you're looking for.</p>
        <Button variant="outline" render={<Link to="/" />}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-12">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full bg-zinc-900/50" render={<Link to={`/menu/${activeOrder.restaurant_id}/${activeOrder.table_id}`} />}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Live Status</span>
          <h1 className="font-bold">Order #{activeOrder.id.slice(-6).toUpperCase()}</h1>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Status Card */}
        <Card className="bg-zinc-900/40 border-zinc-800/50 p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>
          
          <div className="space-y-8 relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl border border-primary/20 mb-4">
                {React.createElement(STAGES[currentStageIndex].icon, { 
                  className: "w-10 h-10 text-primary" 
                })}
              </div>
              <h2 className="text-3xl font-black capitalize">{activeOrder.status}</h2>
              <p className="text-zinc-500 text-sm mt-1">Updated just now</p>
            </div>

            {/* Progress Wrapper */}
            <div className="relative pt-4">
              <div className="flex justify-between relative z-10">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  
                  return (
                    <div key={stage.id} className="flex flex-col items-center gap-2">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                         isCompleted 
                         ? 'bg-primary border-primary text-black' 
                         : 'bg-zinc-900 border-zinc-800 text-zinc-700'
                       } ${isCurrent ? 'scale-125 shadow-[0_0_20px_rgba(var(--primary),0.3)] ring-4 ring-primary/20' : ''}`}>
                          <stage.icon className="w-5 h-5" />
                       </div>
                       <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                         isCompleted ? 'text-zinc-100' : 'text-zinc-700'
                       }`}>
                         {stage.label}
                       </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-[34px] left-5 right-5 h-[2px] bg-zinc-800 -z-0">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-14 rounded-2xl border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-zinc-400">
            <MessageSquare className="w-5 h-5 mr-2" /> Call Waiter
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-zinc-400">
            <Receipt className="w-5 h-5 mr-2" /> View Bill
          </Button>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-1">Order Summary</h3>
          <Card className="bg-zinc-900/20 border-zinc-800/50 overflow-hidden">
            <ScrollArea className="max-h-[300px]">
              <div className="p-4 space-y-4">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-4 border-b border-zinc-800/50 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 border-zinc-700 text-zinc-400 font-bold">
                          {item.quantity}x
                        </Badge>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.instructions && (
                        <p className="text-xs text-zinc-500 italic">"{item.instructions}"</p>
                      )}
                    </div>
                    <span className="font-bold text-sm">₹{item.total}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="bg-zinc-900/40 p-4 border-t border-zinc-800/50">
               <div className="flex justify-between items-center">
                 <span className="text-zinc-500 font-medium">Total Paid</span>
                 <span className="text-xl font-black text-primary">₹{activeOrder.total}</span>
               </div>
            </div>
          </Card>
        </div>

        <div className="text-center space-y-2 py-4">
           <p className="text-xs text-zinc-600 font-medium">Thank you for dining with us!</p>
           <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></span>
           </div>
        </div>
      </main>
    </div>
  );
};

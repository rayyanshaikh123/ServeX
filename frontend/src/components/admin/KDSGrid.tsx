import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ChefHat, Utensils, AlertCircle, DollarSign } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Order } from '../../types';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';

export const KDSGrid = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    fetchOrders();
    const token = useAuthStore.getState().token;
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/restaurant/${restaurantId}?token=${token}`);
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'order.created') {
        setOrders(prev => [data, ...prev]);
        toast.info(`New Order! Table ${data.table_id || 'N/A'}`);
      } else if (type === 'order.updated') {
        setOrders(prev => prev.map(o => o.id === data.id ? data : o));
      } else if (type === 'revenue.updated') {
        toast.success(`💰 Revenue updated: +₹${data.total?.toFixed(2) || '0.00'}`);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, [restaurantId]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get(`/api/orders?limit=50`);
      setOrders(data.items);
    } catch (e) {
      console.error('Failed to fetch orders');
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.post(`/api/orders/${orderId}/status`, { status });
      if (status === 'paid') {
        toast.success(`✅ Order completed & added to revenue!`);
      } else {
        toast.success(`Order marked as ${status}`);
      }
      fetchOrders();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-zinc-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'served': return 'bg-primary';
      default: return 'bg-zinc-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {orders.filter(o => o.status !== 'paid' && o.status !== 'closed').map((order) => (
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden flex flex-col h-full">
              <div className={cn("h-1", getStatusColor(order.status))} />
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
                <div>
                  <h3 className="font-bold text-lg">Table {order.table_id || '??'}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">{order.id.slice(-6)}</span>
                    <span className="text-[10px] text-primary/70 font-bold uppercase tracking-tighter">
                      Target: {new Date(new Date(order.created_at).getTime() + (Math.max(...order.items.map(i => i.time_to_cook || 0)) * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                   {order.status}
                </Badge>
              </div>
              
              <div className="flex-1 p-4 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-zinc-200">
                        <span className="text-primary mr-2">{item.quantity}x</span>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase">
                        <Clock className="w-3 h-3" />
                        {item.time_to_cook || 15}m
                      </div>
                    </div>
                    {item.instructions && (
                      <div className="flex items-start gap-1 p-1.5 bg-orange-500/5 border border-orange-500/10 rounded">
                         <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                         <p className="text-[11px] text-orange-200 leading-tight italic">"{item.instructions}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 grid grid-cols-2 gap-2">
                 {order.status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="w-full col-span-2 bg-blue-600 hover:bg-blue-700 h-9 rounded-lg font-bold uppercase text-[10px]"
                      onClick={() => updateStatus(order.id, 'confirmed')}
                    >
                      Confirm Order
                    </Button>
                 )}
                 {order.status === 'confirmed' && (
                    <Button 
                      size="sm" 
                      className="w-full col-span-2 bg-orange-600 hover:bg-orange-700 h-9 rounded-lg font-bold uppercase text-[10px]"
                      onClick={() => updateStatus(order.id, 'preparing')}
                    >
                      <ChefHat className="w-3.5 h-3.5 mr-1.5" /> Start Cooking
                    </Button>
                 )}
                 {order.status === 'preparing' && (
                    <Button 
                      size="sm" 
                      className="w-full col-span-2 bg-green-600 hover:bg-green-700 h-9 rounded-lg font-bold uppercase text-[10px]"
                      onClick={() => updateStatus(order.id, 'ready')}
                    >
                      Mark Ready
                    </Button>
                 )}
                 {order.status === 'ready' && (
                    <Button 
                      size="sm" 
                      className="w-full col-span-2 bg-primary hover:bg-primary/90 h-9 rounded-lg font-bold uppercase text-[10px]"
                      onClick={() => updateStatus(order.id, 'served')}
                    >
                      <Utensils className="w-3.5 h-3.5 mr-1.5" /> Mark Served
                    </Button>
                 )}
                 {order.status === 'served' && (
                    <Button 
                      size="sm" 
                      className="w-full col-span-2 bg-emerald-600 hover:bg-emerald-700 h-9 rounded-lg font-bold uppercase text-[10px]"
                      onClick={() => updateStatus(order.id, 'paid')}
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Complete Order
                    </Button>
                 )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      {orders.filter(o => o.status !== 'paid' && o.status !== 'closed').length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mb-4" />
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">No Active Orders</p>
          <p className="text-zinc-600 text-xs mt-1">All orders have been completed.</p>
        </div>
      )}
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');




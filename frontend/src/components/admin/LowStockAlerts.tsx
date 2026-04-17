import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../lib/api';

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  category: string;
}

export const LowStockAlerts = ({ restaurantId }: { restaurantId: string }) => {
  const [alerts, setAlerts] = useState<LowStockItem[]>([]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [restaurantId]);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/api/inventory/menu', { params: { low_stock_only: true } });
      setAlerts(data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        stock: item.stock,
        threshold: item.low_stock_threshold || 5,
        category: item.tags?.[0] || 'General'
      })));
    } catch (e) {
      console.error('Failed to load alerts');
    }
  };

  if (alerts.length === 0) return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
       <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-emerald-500 rotate-180" />
       </div>
       <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Inventory Stable</h4>
       <p className="text-[11px] text-zinc-500 mt-1">All catalog items are currently within safe operational thresholds.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {alerts.slice(0, 5).map((item) => (
        <Card key={item.id} className="bg-zinc-900/40 border-zinc-800 p-3 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-200">{item.name}</span>
              <span className="text-[10px] uppercase text-zinc-500 font-bold">{item.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-black text-orange-500">{item.stock}</div>
              <div className="text-[9px] uppercase text-zinc-600 font-bold">In Stock</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
      {alerts.length > 5 && (
        <p className="text-[10px] text-center text-zinc-600 font-bold uppercase pt-2">
          + {alerts.length - 5} more alerts pending
        </p>
      )}
    </div>
  );
};

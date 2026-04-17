import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Info, Edit, MoreVertical } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table } from '../../types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';

export const TableMap = ({ restaurantId }: { restaurantId: string }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore.getState().token;

  useEffect(() => {
    fetchTables();
    
    // Setup WS with token for auth
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/restaurant/${restaurantId}?token=${token}`);
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'table.updated' || type === 'table.created') {
        fetchTables(); // Refresh on update
      }
    };
    return () => ws.close();
  }, [restaurantId, token]);

  const fetchTables = async () => {
    try {
      const { data } = await api.get('/api/tables');
      setTables(data.items);
    } catch (e) {
      toast.error('Failed to load tables');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, status: string) => {
    try {
      await api.patch(`/api/tables/${tableId}`, { status });
      toast.success(`Table status updated to ${status}`);
      fetchTables();
    } catch (e) {
      toast.error('Failed to update table');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'free': return { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Available' };
      case 'occupied': return { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Occupied' };
      case 'dirty': return { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'Cleaning' };
      case 'reserved': return { color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Reserved' };
      default: return { color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20', label: status };
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {tables.map((table) => {
        const info = getStatusInfo(table.status);
        return (
          <Card key={table.id} className="bg-zinc-900 border-zinc-800 p-4 group hover:border-primary/50 transition-all relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-lg">
                {table.name.replace(/\D/g, '') || table.name}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                } />
                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800">
                  <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'free')}>Mark Available</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'occupied')}>Mark Occupied</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'dirty')}>Mark Cleaning</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'reserved')}>Mark Reserved</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{table.name}</span>
                <Badge className={`mt-1 w-fit rounded-full px-2 py-0 text-[10px] uppercase font-black border ${info.color}`}>
                  {info.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-zinc-500">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">{table.capacity} Seats</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

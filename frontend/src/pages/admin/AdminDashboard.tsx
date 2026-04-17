import { Card, CardContent } from "../../components/ui/card";
import { Package, Utensils, Calendar, Clock, ArrowUpRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from 'sonner';
import api from '../../lib/api';
import { KDSGrid } from "../../components/admin/KDSGrid";
import { TableMap } from "../../components/admin/TableMap";
import { LowStockAlerts } from "../../components/admin/LowStockAlerts";
import { useAuthStore } from "../../store/useAuthStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

export const AdminDashboard = () => {
  const { activeRestaurantId } = useAuthStore();
  const [stats, setStats] = useState({ liveOrders: 0, occupiedTables: 0, totalTables: 0 });

  useEffect(() => {
    if (activeRestaurantId) {
      fetchStats();
    }
  }, [activeRestaurantId]);

  const fetchStats = async () => {
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        api.get('/api/orders?limit=100'),
        api.get('/api/tables')
      ]);

      const ordersData = ordersRes.data;
      const tablesData = tablesRes.data;

      setStats({
        liveOrders: ordersData.total,
        occupiedTables: tablesData.items.filter((t: any) => t.status === 'occupied').length,
        totalTables: tablesData.total
      });
    } catch (e) {
      console.error('Failed to fetch stats');
    }
  };

  if (!activeRestaurantId) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Logistics & Operations</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Command Center</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Live Orders', value: stats.liveOrders.toString(), icon: Clock, color: 'text-primary' },
          { label: 'Occupied Tables', value: `${stats.occupiedTables}/${stats.totalTables}`, icon: Utensils, color: 'text-foreground' },
          { label: 'Staff Online', value: '6', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'System Health', value: 'Stable', icon: TrendingUp, color: 'text-foreground' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</span>
              <span className={cn("text-2xl font-light tracking-tight", stat.color)}>{stat.value}</span>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="kds" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/20 border border-border p-1 rounded-xl h-12">
            <TabsTrigger value="kds" className="rounded-lg px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              Kitchen Display (KDS)
            </TabsTrigger>
            <TabsTrigger value="tables" className="rounded-lg px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              Table Management
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <TabsContent value="kds" className="m-0 focus-visible:ring-0">
              <KDSGrid restaurantId={activeRestaurantId} />
            </TabsContent>
            <TabsContent value="tables" className="m-0 focus-visible:ring-0">
              <TableMap restaurantId={activeRestaurantId} />
            </TabsContent>
          </div>

          <div className="space-y-8">
            <Card className="bg-card border-border shadow-none rounded-2xl p-6">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">Inventory Alerts</span>
              <LowStockAlerts restaurantId={activeRestaurantId} />
            </Card>

            <Card className="bg-card border-border shadow-none rounded-2xl p-6">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">Quick Controls</span>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 bg-muted/20 border-border border-dashed flex flex-col gap-1 items-center justify-center hover:bg-muted/30 hover:border-primary/50 transition-all rounded-xl">
                  <Utensils className="w-4 h-4 text-primary" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Floor Reset</span>
                </Button>
                <Button variant="outline" className="h-20 bg-muted/20 border-border border-dashed flex flex-col gap-1 items-center justify-center hover:bg-muted/30 hover:border-primary/50 transition-all rounded-xl">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">PoS Link</span>
                </Button>
              </div>
            </Card>

            <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-none rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-bold mb-1">System Health</span>
              <span className="text-[13px] text-foreground font-serif italic text-emerald-500">Live Services Active</span>
              <p className="text-[11px] text-muted-foreground mt-2 px-4">WebSocket and AI nodes are communicating normally across all channels.</p>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

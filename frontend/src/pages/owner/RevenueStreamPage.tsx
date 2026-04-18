import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { TrendingUp, DollarSign, PieChart, ArrowUpRight, Download, Layers, Zap, Loader2 } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import api from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";

export const RevenueStreamPage = () => {
  const { activeRestaurantId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get('/api/analytics/summary'),
        api.get('/api/orders?status=paid&limit=20'),
      ]);
      setAnalytics(analyticsRes.data);
      setOrders(ordersRes.data?.items || []);
    } catch (e) {
      console.error('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  // Build hourly chart data from analytics
  const hourlyData = analytics?.hourly_revenue
    ? Object.entries(analytics.hourly_revenue).map(([hour, rev]) => ({
        hour: `${hour}:00`,
        revenue: rev as number,
      }))
    : [];

  // Build top items bar chart
  const topItems = (analytics?.top_items || []).slice(0, 6).map((item: any) => ({
    name: item.name?.split(' ')[0] || 'Item',
    revenue: item.revenue || 0,
    qty: item.quantity || 0,
  }));

  const totalRevenue = analytics?.total_revenue ?? 0;
  const totalOrders = analytics?.orders ?? 0;
  const avgCheck = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Capital Management</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Revenue Stream</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4" onClick={fetchData}>
            Refresh
          </Button>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold px-6">
          <Download className="w-4 h-4 mr-2" />
          Financial Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, sub: `${analytics?.window_days || 30} day window`, icon: Layers },
          { label: 'Completed Orders', value: totalOrders.toString(), sub: 'Paid & closed orders', icon: Zap },
          { label: 'Avg. Check', value: `₹${avgCheck}`, sub: 'Per completed order', icon: PieChart },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</span>
                <span className="text-2xl font-light text-foreground">{stat.value}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground italic">{stat.sub}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Hourly Revenue Today</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData.length > 0 ? hourlyData : [{ hour: 'No data', revenue: 0 }]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#141417', borderRadius: '4px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '11px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-8 block">Top Revenue Items</span>
          <div className="space-y-4">
            {topItems.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic text-center py-8">No data yet — complete some orders.</p>
            ) : topItems.map((item: any, i: number) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground truncate max-w-[60%]">{item.name}</span>
                  <span className="text-[12px] font-mono font-bold text-primary">₹{item.revenue.toFixed(0)}</span>
                </div>
                <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 transition-all"
                    style={{ width: `${topItems[0]?.revenue ? Math.min(100, (item.revenue / topItems[0].revenue) * 100) : 0}%` }}
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-[10px] text-zinc-500 font-bold">{item.qty} sold</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Recent Completed Orders</span>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">Order ID</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Table</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Date</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Total</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  No completed orders yet. Mark orders as "paid" in the Admin KDS to see them here.
                </TableCell>
              </TableRow>
            ) : orders.map((order: any) => (
              <TableRow key={order.id} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-[11px] text-muted-foreground py-4 pl-6">#{order.id.slice(-8).toUpperCase()}</TableCell>
                <TableCell className="text-[13px] font-medium">{order.table_id || 'Takeaway'}</TableCell>
                <TableCell className="text-[12px] text-muted-foreground">
                  {order.updated_at ? new Date(order.updated_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                </TableCell>
                <TableCell className="text-[13px] font-bold text-foreground">₹{order.total?.toFixed(2)}</TableCell>
                <TableCell className="pr-6 text-right">
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-bold border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

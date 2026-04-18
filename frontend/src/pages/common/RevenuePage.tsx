import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { DollarSign, CreditCard, ShoppingBag, Banknote, Download, Filter, Search, Loader2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import api from "../../lib/api";

export const RevenuePage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get('/api/analytics/summary'),
        api.get('/api/orders?limit=50'),
      ]);
      setAnalytics(analyticsRes.data);
      setOrders(ordersRes.data?.items || []);
    } catch (e) {
      console.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = analytics?.total_revenue ?? 0;
  const activeOrders = analytics?.active_orders ?? 0;
  const dailyOrders = analytics?.daily_orders ?? 0;
  const avgCheck = dailyOrders > 0 ? (totalRevenue / Math.max(analytics?.orders ?? 1, 1)).toFixed(2) : '0.00';

  // Build hourly chart data
  const hourlyData = analytics?.hourly_revenue
    ? Object.entries(analytics.hourly_revenue).map(([h, rev]) => ({
        hour: `${h}:00`,
        revenue: rev as number,
      }))
    : [];

  // Top items
  const topItems = (analytics?.top_items || []).slice(0, 5);

  // Recent orders (filter by search)
  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.table_id || '').toLowerCase().includes(search.toLowerCase()) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Financial Sovereignty</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Revenue Stream</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Gross Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: `${analytics?.window_days || 30}d window`, icon: DollarSign },
          { label: 'Active Orders', value: activeOrders.toString(), change: 'Live in kitchen', icon: ShoppingBag },
          { label: 'Avg. Check', value: `₹${avgCheck}`, change: 'Per completed order', icon: CreditCard },
          { label: 'Orders Today', value: dailyOrders.toString(), change: 'Total placed today', icon: Banknote },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <Download className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</span>
              <span className="text-3xl font-light text-foreground">{stat.value}</span>
              <span className="text-[10px] font-mono text-emerald-500 italic mt-2">{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Hourly Revenue Today</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData.length > 0 ? hourlyData : [{ hour: 'No data', revenue: 0 }]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#141417', borderRadius: '4px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '11px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">Top Revenue Items</span>
          <div className="space-y-4">
            {topItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-8">No items yet.</p>
            ) : topItems.map((item: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium truncate max-w-[65%]">{item.name}</span>
                  <span className="font-mono text-[11px] font-bold text-primary">₹{(item.revenue || 0).toFixed(0)}</span>
                </div>
                <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60"
                    style={{ width: `${topItems[0]?.revenue ? Math.min(100, (item.revenue / topItems[0].revenue) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Recent Orders</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                className="bg-card border-border h-8 pl-9 text-xs w-56"
                placeholder="Search by table or status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">Order ID</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Table</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Date</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Amount</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : filteredOrders.map((order: any) => (
              <TableRow key={order.id} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-[11px] text-muted-foreground py-4 pl-6">#{order.id.slice(-8).toUpperCase()}</TableCell>
                <TableCell className="text-[13px] font-medium">{order.table_id || 'Takeaway'}</TableCell>
                <TableCell className="text-[12px] text-muted-foreground">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </TableCell>
                <TableCell className="text-[13px] font-bold text-foreground">₹{order.total?.toFixed(2)}</TableCell>
                <TableCell className="pr-6 text-right">
                  <span className={cn(
                    "text-[10px] uppercase px-1.5 py-0.5 rounded font-bold border",
                    order.status === 'paid' || order.status === 'served'
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : order.status === 'pending' || order.status === 'confirmed'
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  )}>
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

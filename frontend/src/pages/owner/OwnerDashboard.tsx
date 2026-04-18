import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { TrendingUp, Users, DollarSign, ShoppingBag, Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import api from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";

export const OwnerDashboard = () => {
  const { activeRestaurantId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    if (activeRestaurantId) {
      fetchData();
      // Poll every 30s so active orders & revenue stay fresh
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [activeRestaurantId]);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/api/analytics/summary');
      setStats(data);
      if (data.hourly_revenue) {
        const chartData = Object.entries(data.hourly_revenue).map(([hour, rev]) => ({
          name: `${hour}:00`,
          revenue: rev,
        }));
        setRevenueData(chartData);
      }
    } catch (e) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback to defaults if stats is null or missing fields
  const summary = {
    total_revenue: stats?.total_revenue ?? 0,
    active_orders: stats?.active_orders ?? 0,
    daily_orders: stats?.daily_orders ?? 0,
    performance_score: stats?.performance_score ?? 0
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Insights & Performance</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Executive Summary</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue (All Time)', value: `${summary.total_revenue.toLocaleString()} INR`, change: '+0% from yesterday', icon: DollarSign },
          { label: 'Active Orders', value: summary.active_orders.toString(), change: 'Live in kitchen', icon: ShoppingBag },
          { label: 'Performance', value: `${(summary.performance_score * 10).toFixed(1)}/10`, change: 'Based on prep times', icon: TrendingUp },
          { label: 'Daily Volume', value: summary.daily_orders.toString(), change: 'Total orders today', icon: Users },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{kpi.label}</span>
              <kpi.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-light tracking-tight text-foreground">{kpi.value}</div>
              <p className="text-[10px] mt-1 font-medium text-emerald-500">
                {kpi.change}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-7 bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Revenue Timeline (Hourly)</span>
            <span className="text-[11px] text-primary cursor-pointer hover:underline">Download Report</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.length ? revenueData : [{ name: '00:00', revenue: 0 }]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#71717a' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141417', borderRadius: '4px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">System Status</span>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-4 opacity-20" />
          <p className="text-sm">Real-time staff log and system health monitoring coming soon.</p>
        </div>
      </Card>
    </div>
  );
};

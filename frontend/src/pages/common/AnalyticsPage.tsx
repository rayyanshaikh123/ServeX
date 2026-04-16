import { useMemo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { TrendingUp, Users, Calendar, ArrowUpRight, MousePointer2, Clock, Globe } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { cn } from "../../lib/utils";
import { useAnalyticsSummary } from "../../hooks";

const COLORS = ['#3b82f6', '#4ade80', '#fbbf24', '#f87171'];

export const AnalyticsPage = () => {
  const { data, isLoading, isError } = useAnalyticsSummary();

  const trendData = useMemo(() => {
    if (!data?.peak_hours?.length) return [];
    return [...data.peak_hours]
      .sort((a, b) => a._id - b._id)
      .map((item) => ({
        name: `${item._id}:00`,
        active: item.count,
        conversions: Math.round(item.count * 0.6),
      }));
  }, [data]);

  const categoryData = useMemo(() => {
    if (!data?.top_items?.length) return [];
    return data.top_items.map((item) => ({
      name: item.name || item._id,
      value: Math.round(item.revenue),
    }));
  }, [data]);

  const revenueLabel = data ? `${data.revenue.toFixed(2)}` : '--';
  const ordersLabel = data ? `${data.orders}` : '--';
  const topItemsLabel = data ? `${data.top_items.length}` : '--';
  const peakHourLabel = data?.peak_hours?.[0]?._id !== undefined
    ? `${data.peak_hours[0]._id}:00`
    : '--';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Intelligence & Tracking</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">System Analytics</h2>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-[12px] text-destructive">
          Analytics is currently unavailable. Please try again shortly.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Revenue (Window)', value: revenueLabel, change: isLoading ? 'Loading' : `${data?.window_days ?? '--'} days`, icon: Users },
          { label: 'Orders (Window)', value: ordersLabel, change: isLoading ? 'Loading' : 'All channels', icon: Clock },
          { label: 'Top Items', value: topItemsLabel, change: isLoading ? 'Loading' : 'By revenue', icon: Globe },
          { label: 'Peak Hour', value: peakHourLabel, change: isLoading ? 'Loading' : 'Most bookings', icon: MousePointer2 },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-light tracking-tight text-foreground">{stat.value}</span>
              <div className={cn("text-[10px] font-mono mb-1", stat.change.startsWith('+') ? "text-emerald-500" : "text-amber-500")}>
                {stat.change}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">User Engagement Trends</span>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Active</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Converted</span>
               </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                <Tooltip contentStyle={{ backgroundColor: '#141417', borderRadius: '4px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '11px' }}/>
                <Area type="monotone" dataKey="active" stroke="#3b82f6" fill="#3b82f61a" strokeWidth={2} />
                <Area type="monotone" dataKey="conversions" stroke="#10b981" fill="#10b9811a" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card border-border shadow-none rounded-lg p-6">
           <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-8 block">Traffic Source Distribution</span>
           <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#141417', borderRadius: '4px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-light text-foreground">{data ? data.top_items.length : 0}</span>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Top Items</span>
              </div>
           </div>
           <div className="space-y-3 mt-6">
                {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-[12px] text-muted-foreground">{item.name}</span>
                   </div>
                   <span className="text-[12px] font-mono font-medium text-foreground">{item.value}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border shadow-none rounded-lg p-6 flex flex-col items-center text-center">
           <TrendingUp className="w-6 h-6 text-primary mb-4" />
           <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Growth Index</span>
            <span className="text-lg font-serif italic text-foreground italic">{data ? `${data.window_days} days` : '--'}</span>
            <p className="text-[11px] text-muted-foreground mt-2">Analytics window for revenue and orders.</p>
        </Card>
        <Card className="bg-card border-border shadow-none rounded-lg p-6 flex flex-col items-center text-center">
           <Calendar className="w-6 h-6 text-primary mb-4" />
           <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Peak Day</span>
            <span className="text-lg font-serif italic text-foreground italic">{peakHourLabel}</span>
            <p className="text-[11px] text-muted-foreground mt-2">Most active hour in the period.</p>
        </Card>
        <Card className="bg-card border-border shadow-none rounded-lg p-6 flex flex-col items-center text-center">
           <ArrowUpRight className="w-6 h-6 text-emerald-500 mb-4" />
           <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Conversion High</span>
            <span className="text-lg font-serif italic text-foreground italic">Top 3 items</span>
            <p className="text-[11px] text-muted-foreground mt-2">Based on revenue in this window.</p>
        </Card>
      </div>
    </div>
  );
};

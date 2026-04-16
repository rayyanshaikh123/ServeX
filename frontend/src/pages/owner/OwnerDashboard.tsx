import { Card } from "../../components/ui/card";
import { TrendingUp, Users, DollarSign, ShoppingBag } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

const data = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 3000, orders: 198 },
  { name: 'Mar', revenue: 2000, orders: 150 },
  { name: 'Apr', revenue: 2780, orders: 210 },
  { name: 'May', revenue: 1890, orders: 180 },
  { name: 'Jun', revenue: 2390, orders: 200 },
  { name: 'Jul', revenue: 3490, orders: 250 },
];

const admins = [
  { name: 'Sarah Wilson', role: 'ADMIN', email: 'sarah@servex.com', status: 'Active' },
  { name: 'David Miller', role: 'ADMIN', email: 'david@servex.com', status: 'Active' },
  { name: 'Anna Taylor', role: 'ADMIN', email: 'anna@servex.com', status: 'Active' },
];

export const OwnerDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Insights & Performance</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Executive Summary</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue (Daily)', value: '$45,231.89', change: '+14.2% from yesterday', icon: DollarSign },
          { label: 'Active Orders', value: '18', change: '4 Pending Pickup', icon: ShoppingBag },
          { label: 'Inventory Health', value: '94%', change: '2 items low stock', icon: Users, alert: true },
          { label: 'Admins Online', value: `${admins.length}`, change: 'Active accounts', icon: TrendingUp },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{kpi.label}</span>
              <kpi.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-3xl font-light tracking-tight text-foreground">{kpi.value}</div>
              <p className={cn(
                "text-[10px] mt-1 font-medium",
                kpi.alert ? "text-amber-500" : "text-emerald-500"
              )}>
                {kpi.change}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Revenue Stream</span>
            <span className="text-[11px] text-primary cursor-pointer hover:underline">Download Report</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a"/>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#71717a'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#71717a'}}
                  tickFormatter={(value) => `$${value}`}
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
        
        <Card className="lg:col-span-3 bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Daily Orders</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#27272a"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                <Tooltip cursor={{fill: '#18181b'}} contentStyle={{ backgroundColor: '#141417', borderRadius: '4px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '12px' }}/>
                <Bar dataKey="orders" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admin Overview</span>
        </div>
        <Table className="border-none">
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Full Name</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Role</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Email Address</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((member) => (
              <TableRow key={member.email} className="border-border hover:bg-muted/20">
                <TableCell className="font-medium text-[13px] py-4">{member.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[10px] uppercase px-2 py-0 h-5 border-none",
                    member.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-[12px]">{member.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                     <div className={cn("w-1.5 h-1.5 rounded-full", member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500')} />
                     <span className="text-[12px]">{member.status}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

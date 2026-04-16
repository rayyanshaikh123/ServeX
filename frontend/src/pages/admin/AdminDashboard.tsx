import { Card, CardContent } from "../../components/ui/card";
import { Package, Utensils, Calendar, Clock, ArrowUpRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export const AdminDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Logistics & Operations</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Admin Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Tables', value: '18/24', icon: Utensils, color: 'text-primary' },
          { label: 'Pending Bookings', value: '12', icon: Calendar, color: 'text-foreground' },
          { label: 'Inventory Value', value: '$12,450', icon: Package, color: 'text-foreground' },
          { label: 'Low Stock Alerts', value: '3', icon: AlertCircle, color: 'text-destructive' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-none rounded-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Recent Logistics History</span>
            <Button variant="ghost" className="text-[11px] text-primary font-bold uppercase tracking-widest p-0 h-auto">View Full Log</Button>
          </div>
          <div className="space-y-6">
            {[
              { type: 'INVENTORY', desc: 'Received 50kg Beef Brisket', time: '14:20', status: 'Completed' },
              { type: 'BOOKING', desc: 'Table #4 Reserved for Alexander Pierce', time: '13:45', status: 'Confirmed' },
              { type: 'STOCK', desc: 'Low Stock Alert: Organic Spinach', time: '11:15', status: 'Alert' },
              { type: 'TABLE', desc: 'Table #12 Status updated to Cleaning', time: '10:30', status: 'System' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/10 p-2 rounded-md transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                  <div className="flex flex-col">
                    <span className="text-[13px] text-foreground font-medium">{item.desc}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{item.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className="text-[11px] font-mono text-muted-foreground">{item.time}</span>
                   <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-border px-1.5 h-5">{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="bg-card border-border shadow-none rounded-lg p-6">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">Quick Operational Controls</span>
            <div className="grid grid-cols-2 gap-3">
               <Button variant="outline" className="h-20 bg-muted/20 border-border border flex flex-col gap-1 items-center justify-center">
                 <Utensils className="w-4 h-4 text-primary" />
                 <span className="text-[10px] uppercase tracking-widest font-bold">Clear Floor</span>
               </Button>
               <Button variant="outline" className="h-20 bg-muted/20 border-border border flex flex-col gap-1 items-center justify-center">
                 <TrendingUp className="w-4 h-4 text-primary" />
                 <span className="text-[10px] uppercase tracking-widest font-bold">Close Day</span>
               </Button>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-none rounded-lg p-6 flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
               <CheckCircle2 className="w-6 h-6 text-emerald-500" />
             </div>
             <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">System Health</span>
             <span className="text-[13px] text-foreground font-serif italic">Inventory Synchronized</span>
             <p className="text-[11px] text-muted-foreground mt-2">All supply chain channels are currently stable and matching floor usage.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

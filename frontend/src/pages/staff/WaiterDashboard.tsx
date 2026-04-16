import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Utensils, CreditCard, CheckCircle2, Search, Map as FloorMap, Clock, AlertCircle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { cn } from "../../lib/utils";

const tables = [
  { id: '1', number: 1, status: 'AVAILABLE', type: 'Booth' },
  { id: '2', number: 2, status: 'OCCUPIED', type: 'Window' },
  { id: '3', number: 3, status: 'AVAILABLE', type: 'Terrace' },
  { id: '4', number: 4, status: 'OCCUPIED', type: 'Booth' },
  { id: '5', number: 5, status: 'CLEANING', type: 'Window' },
  { id: '6', number: 6, status: 'AVAILABLE', type: 'Standard' },
];

export const WaiterDashboard = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Service Terminal</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Waiter Floor View</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Floor Map Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 h-5">3 Available</Badge>
               <Badge className="bg-primary/10 text-primary border-none px-2 h-5">2 Occupied</Badge>
               <Badge className="bg-amber-500/10 text-amber-500 border-none px-2 h-5">1 Cleaning</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold">
               <FloorMap className="w-3.5 h-3.5 mr-2" />
               Edit Layout
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tables.map((table) => (
              <Card 
                key={table.id}
                onClick={() => setSelectedTable(table.id)}
                className={cn(
                  "h-40 flex flex-col items-center justify-center text-center p-6 transition-all border-dashed bg-transparent cursor-pointer group hover:scale-[1.02]",
                  selectedTable === table.id 
                    ? "bg-primary/5 border-solid border-primary ring-1 ring-primary/20" 
                    : table.status === 'AVAILABLE' 
                    ? "border-border hover:border-emerald-500/50" 
                    : table.status === 'OCCUPIED'
                    ? "border-solid border-primary/40 bg-primary/5"
                    : "border-solid border-amber-500/40 bg-amber-500/5"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full mb-3 flex items-center justify-center transition-colors font-serif italic text-lg",
                  table.status === 'AVAILABLE' ? "bg-muted/10 text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500" :
                  table.status === 'OCCUPIED' ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-500"
                )}>
                  {table.number}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{table.type}</span>
                <span className="text-[11px] mt-1 font-medium">{table.status}</span>
              </Card>
            ))}
          </div>

          {selectedTable && (
            <Card className="bg-card border-primary/30 animate-in slide-in-from-bottom-4">
              <div className="p-6 flex items-center justify-between border-b border-border">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Action Suite</span>
                  <h3 className="text-lg font-serif italic text-foreground tracking-tight">Table #{tables.find(t => t.id === selectedTable)?.number}</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold" onClick={() => setSelectedTable(null)}>Dismiss</Button>
              </div>
              <CardContent className="p-6 grid grid-cols-3 gap-4">
                <Button 
                  onClick={() => navigate('/staff/orders/new')}
                  className="h-24 bg-primary hover:bg-primary/90 text-white flex flex-col gap-2 rounded-xl"
                >
                  <Utensils className="w-5 h-5" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">New Order</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-xl border-border bg-muted/10 hover:bg-muted/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Mark Occupied</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-xl border-border bg-muted/10 hover:bg-muted/30">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Needs Service</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-border shadow-none rounded-lg p-6">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">My Session</span>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-[13px] text-muted-foreground italic">Current Shift</span>
                </div>
                <span className="text-[13px] font-mono">04h 12m</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Utensils className="w-4 h-4 text-primary" />
                  <span className="text-[13px] text-muted-foreground italic">Orders Placed</span>
                </div>
                <span className="text-[13px] font-mono">18</span>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-none rounded-lg p-6">
             <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">Directives</span>
             <div className="space-y-4">
                <div className="p-4 bg-muted/10 rounded-lg border border-border/50 border-l-primary border-l-2">
                   <p className="text-[11px] text-muted-foreground italic leading-relaxed">Large party arriving in 15 minutes at Table 8. Ensure terrace is clear.</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg border border-border/50 border-l-amber-500 border-l-2">
                   <p className="text-[11px] text-muted-foreground italic leading-relaxed">Lobster Ravioli low stock. Advise guests before ordering.</p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Utensils, CreditCard, ChevronRight, CheckCircle2, Search, Filter } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";

const tables = [
  { id: '1', number: 1, status: 'AVAILABLE', seats: 2 },
  { id: '2', number: 2, status: 'OCCUPIED', seats: 4 },
  { id: '3', number: 3, status: 'AVAILABLE', seats: 4 },
  { id: '4', number: 4, status: 'OCCUPIED', seats: 6 },
  { id: '5', number: 5, status: 'AVAILABLE', seats: 2 },
  { id: '6', number: 6, status: 'WAITING', seats: 4 },
  { id: '7', number: 7, status: 'AVAILABLE', seats: 4 },
  { id: '8', number: 8, status: 'OCCUPIED', seats: 8 },
];

const activeOrders = [
  { id: 'ORD-001', table: 'Table 2', total: '$145.00', status: 'In Cooking', items: 3 },
  { id: 'ORD-002', table: 'Table 4', total: '$89.50', status: 'Ready to Serve', items: 2 },
  { id: 'ORD-003', table: 'Table 6', total: '$210.00', status: 'In Cooking', items: 5 },
];

import { cn } from "../../lib/utils";

export const StaffDashboard = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Service & Floor</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Active Operations</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card 
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={cn(
                "h-32 flex flex-col items-center justify-center text-center p-4 transition-all border-dashed bg-transparent cursor-pointer group",
                selectedTable === table.id 
                  ? "bg-primary/10 border-solid border-primary" 
                  : table.status === 'AVAILABLE' 
                    ? "border-border hover:border-muted-foreground/50" 
                    : table.status === 'OCCUPIED'
                    ? "bg-blue-500/5 border-solid border-primary"
                    : "bg-amber-500/5 border-solid border-amber-500/30"
              )}
            >
              <span className={cn(
                "text-[10px] uppercase font-bold tracking-widest mb-1",
                table.status === 'OCCUPIED' || selectedTable === table.id ? "text-primary" : "text-muted-foreground"
              )}>
                Table {table.number}
              </span>
              <span className={cn(
                "text-[9px] opacity-70",
                table.status === 'OCCUPIED' || selectedTable === table.id ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {table.status === 'OCCUPIED' ? '4 Guests' : table.status === 'AVAILABLE' ? 'Available' : 'Waiting'}
              </span>
            </Card>
          ))}
        </div>

        {/* Action Panel based on selected table */}
        {selectedTable && (
          <Card className="bg-card border border-primary/30 shadow-none rounded-lg animate-in slide-in-from-bottom-2">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Table Action</span>
                <h3 className="text-lg font-serif italic text-foreground tracking-tight">Unit #{tables.find(t => t.id === selectedTable)?.number}</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground" onClick={() => setSelectedTable(null)}>Cancel</Button>
            </div>
            <CardContent className="grid gap-4 md:grid-cols-3 p-5">
              <Button 
                onClick={() => navigate('/staff/orders/new')}
                className="h-20 bg-primary hover:bg-primary/90 text-white flex flex-col gap-1 rounded-md"
              >
                <Utensils className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-bold">New Order</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1 border-border bg-muted/20 hover:bg-muted/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground">Occupied</span>
              </Button>
              <Button 
                onClick={() => navigate('/staff/payments')}
                variant="outline" 
                className="h-20 flex flex-col gap-1 border-border bg-muted/20 hover:bg-muted/40"
              >
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground">Payment</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-4 space-y-6">
        <Card className="h-full bg-card border-border shadow-none rounded-lg flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Live Orders</span>
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-primary/20 bg-primary/5 text-primary">Active</Badge>
          </div>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-[500px]">
              <div className="p-5 space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-muted/20 border border-border rounded-lg group hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground italic mb-1 block">#{order.id}</span>
                        <h4 className="font-bold text-[14px] text-foreground">{order.table}</h4>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-none bg-blue-500/10 text-blue-400 px-1.5">{order.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center pb-3 mb-3 border-b border-border/50">
                      <span className="text-[12px] text-muted-foreground">{order.items} Items</span>
                      <span className="text-[13px] font-bold text-foreground">{order.total}</span>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="outline" className="flex-1 h-8 text-[10px] uppercase tracking-widest font-bold border-border bg-card">Modify</Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-5 bg-muted/10 border-t border-border flex flex-col gap-4">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input placeholder="Search orders..." className="bg-card border-border border h-10 pl-10 text-xs focus-visible:ring-primary" />
             </div>
             <Button className="w-full bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold">
               All Activity
             </Button>
          </CardFooter>
        </Card>
      </div>
      </div>
    </div>
  );
};

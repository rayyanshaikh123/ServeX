import { Card, CardContent } from "../../components/ui/card";
import { Utensils, Plus, RotateCcw, LayoutGrid, CheckCircle2, XCircle, MoreVertical, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

const tables = [
  { id: 'T1', number: 1, seats: 2, status: 'AVAILABLE', section: 'Main Hall' },
  { id: 'T2', number: 2, seats: 4, status: 'OCCUPIED', section: 'Main Hall' },
  { id: 'T3', number: 3, seats: 4, status: 'RESERVED', section: 'Main Hall' },
  { id: 'T4', number: 4, seats: 6, status: 'CLEANING', section: 'Terrace' },
  { id: 'T5', number: 5, seats: 2, status: 'AVAILABLE', section: 'Terrace' },
  { id: 'T6', number: 6, seats: 8, status: 'OCCUPIED', section: 'VIP' },
  { id: 'T7', number: 7, seats: 4, status: 'AVAILABLE', section: 'Main Hall' },
  { id: 'T8', number: 8, seats: 2, status: 'AVAILABLE', section: 'Bar' },
];

export const TablesPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Floor Configuration</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Table Management</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid View
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            List View
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold px-6">
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: '24', icon: RotateCcw },
          { label: 'Available', value: '12', icon: CheckCircle2, color: 'text-blue-500' },
          { label: 'Occupied', value: '8', icon: Utensils, color: 'text-foreground' },
          { label: 'Cleaning', value: '4', icon: XCircle, color: 'text-amber-500' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</span>
            <span className={cn("text-xl font-light", stat.color)}>{stat.value}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map(table => (
          <Card key={table.id} className="bg-card border-border shadow-none rounded-lg p-6 group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{table.section}</span>
                <span className="text-2xl font-light text-foreground">{table.id}</span>
              </div>
              <Badge variant="outline" className={cn(
                "text-[9px] uppercase tracking-tighter border-none px-2 py-0 h-5",
                table.status === 'AVAILABLE' ? 'bg-blue-500/10 text-blue-400' : 
                table.status === 'CLEANING' ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'
              )}>
                {table.status}
              </Badge>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Capacity</span>
                    <span className="text-[13px] text-foreground">{table.seats} Guests Max</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <span className="text-[11px] text-primary cursor-pointer hover:underline font-medium">Edit Config</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground group-hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

import { useMemo } from "react";
import { Card } from "../../components/ui/card";
import { Utensils, Plus, RotateCcw, LayoutGrid, CheckCircle2, XCircle, MoreVertical, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { useTables } from "../../hooks";

export const TablesPage = () => {
  const { data, isLoading, isError } = useTables();

  const tables = useMemo(() => data?.items ?? [], [data]);

  const statusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'free':
        return 'AVAILABLE';
      case 'occupied':
        return 'OCCUPIED';
      case 'reserved':
        return 'RESERVED';
      case 'cleaning':
        return 'CLEANING';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const counts = useMemo(() => {
    const total = tables.length;
    const available = tables.filter((table) => statusLabel(table.status) === 'AVAILABLE').length;
    const occupied = tables.filter((table) => statusLabel(table.status) === 'OCCUPIED').length;
    const cleaning = tables.filter((table) => statusLabel(table.status) === 'CLEANING').length;
    return { total, available, occupied, cleaning };
  }, [tables]);

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
          { label: 'Total', value: `${counts.total}`, icon: RotateCcw },
          { label: 'Available', value: `${counts.available}`, icon: CheckCircle2, color: 'text-blue-500' },
          { label: 'Occupied', value: `${counts.occupied}`, icon: Utensils, color: 'text-foreground' },
          { label: 'Cleaning', value: `${counts.cleaning}`, icon: XCircle, color: 'text-amber-500' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</span>
            <span className={cn("text-xl font-light", stat.color)}>{stat.value}</span>
          </Card>
        ))}
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-[12px] text-destructive">
          Tables are currently unavailable.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map(table => (
          <Card key={table.id} className="bg-card border-border shadow-none rounded-lg p-6 group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Dining Area</span>
                <span className="text-2xl font-light text-foreground">{table.name}</span>
              </div>
              <Badge variant="outline" className={cn(
                "text-[9px] uppercase tracking-tighter border-none px-2 py-0 h-5",
                statusLabel(table.status) === 'AVAILABLE' ? 'bg-blue-500/10 text-blue-400' : 
                statusLabel(table.status) === 'CLEANING' ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'
              )}>
                {statusLabel(table.status)}
              </Badge>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Capacity</span>
                      <span className="text-[13px] text-foreground">{table.capacity} Guests Max</span>
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

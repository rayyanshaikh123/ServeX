import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Package, Plus, Search, MoreHorizontal, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { useMenuItems } from "../../hooks";

export const InventoryPage = () => {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { data, isLoading, isError } = useMenuItems({ low_stock_only: lowStockOnly });

  const items = useMemo(() => {
    const list = data?.items ?? [];
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter((item) => item.name.toLowerCase().includes(term));
  }, [data, search]);

  const lowStockCount = data?.items.filter((item) => {
    if (item.low_stock_threshold === null || item.low_stock_threshold === undefined) {
      return false;
    }
    return item.stock <= item.low_stock_threshold;
  }).length ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Resource Management</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Supply & Inventory</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="bg-card border-border h-10 pl-10 text-sm w-80 focus-visible:ring-primary"
              placeholder="Search inventory items..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4"
            onClick={() => setLowStockOnly((prev) => !prev)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {lowStockOnly ? 'Low Stock' : 'Filter'}
          </Button>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold px-6">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Items', value: `${data?.total ?? 0}`, change: isLoading ? 'Loading' : 'All items', color: 'text-foreground' },
          { label: 'Low Stock Items', value: `${lowStockCount}`, change: isLoading ? 'Loading' : 'Needs review', color: 'text-amber-500' },
          { label: 'Filter Mode', value: lowStockOnly ? 'Low' : 'All', change: 'Current', color: 'text-blue-500' },
          { label: 'Search Hits', value: `${items.length}`, change: 'Matches', color: 'text-foreground' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">{stat.label}</span>
            <div className="flex items-end justify-between">
              <span className={cn("text-2xl font-light tracking-tight", stat.color)}>{stat.value}</span>
              <span className="text-[10px] font-mono text-muted-foreground italic mb-1">{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        {isError && (
          <div className="p-4 text-[12px] text-destructive">
            Inventory is currently unavailable.
          </div>
        )}
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">ID</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Item Name</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Category</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Quantity</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Unit Price</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Status</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const threshold = item.low_stock_threshold ?? 0;
              const status = item.stock <= 0
                ? 'Out'
                : item.stock <= threshold
                  ? 'Low'
                  : 'In Stock';
              const category = item.tags?.[0] || item.spiceLevel || 'General';

              return (
              <TableRow key={item.id} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-[11px] text-muted-foreground py-4 pl-6">#{item.id.slice(-6)}</TableCell>
                <TableCell className="font-medium text-[13px] py-4">{item.name}</TableCell>
                <TableCell className="text-muted-foreground text-[12px]">{category}</TableCell>
                <TableCell className="text-[13px]">{item.stock} units</TableCell>
                <TableCell className="text-[13px] font-mono text-muted-foreground">{item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[9px] uppercase tracking-tighter border-none px-2 py-0 h-5",
                    status === 'In Stock' ? 'bg-blue-500/10 text-blue-400' : 
                    status === 'Low' ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'
                  )}>
                    {status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

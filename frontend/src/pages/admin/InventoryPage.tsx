import { Card, CardContent } from "../../components/ui/card";
import { Package, Plus, Search, MoreHorizontal, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

const inventory = [
  { id: '1', name: 'Premium Beef Brisket', category: 'Meats', stock: 45, unit: 'kg', status: 'In Stock', price: '$22.50' },
  { id: '2', name: 'Fresh Salmon Fillet', category: 'Seafood', stock: 12, unit: 'kg', status: 'Low Stock', price: '$34.00' },
  { id: '3', name: 'Organic Spinach', category: 'Produce', stock: 8, unit: 'kg', status: 'Critical', price: '$5.50' },
  { id: '4', name: 'Truffle Oil', category: 'Dry Goods', stock: 15, unit: 'bottles', status: 'In Stock', price: '$85.00' },
  { id: '5', name: 'House Red Wine', category: 'Beverages', stock: 120, unit: 'bottles', status: 'In Stock', price: '$18.00' },
  { id: '6', name: 'Aged Balsamic', category: 'Dry Goods', stock: 30, unit: 'bottles', status: 'In Stock', price: '$42.00' },
];

export const InventoryPage = () => {
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
            <Input className="bg-card border-border h-10 pl-10 text-sm w-80 focus-visible:ring-primary" placeholder="Search inventory items..." />
          </div>
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold px-6">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Value', value: '$45,230', change: '+12%', color: 'text-foreground' },
          { label: 'Low Stock Items', value: '14', change: '-2', color: 'text-amber-500' },
          { label: 'Pending Orders', value: '5', change: 'Live', color: 'text-blue-500' },
          { label: 'Stock Turnover', value: '8.4x', change: 'Healthy', color: 'text-foreground' },
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
            {inventory.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-[11px] text-muted-foreground py-4 pl-6">#{item.id}</TableCell>
                <TableCell className="font-medium text-[13px] py-4">{item.name}</TableCell>
                <TableCell className="text-muted-foreground text-[12px]">{item.category}</TableCell>
                <TableCell className="text-[13px]">{item.stock} {item.unit}</TableCell>
                <TableCell className="text-[13px] font-mono text-muted-foreground">{item.price}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[9px] uppercase tracking-tighter border-none px-2 py-0 h-5",
                    item.status === 'In Stock' ? 'bg-blue-500/10 text-blue-400' : 
                    item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'
                  )}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

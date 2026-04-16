import { Card, CardContent } from "../../components/ui/card";
import { FileText, Download, Search, Filter, Printer, MoreVertical, CreditCard, DollarSign } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { cn } from "../../lib/utils";

const invoices = [
  { id: 'INV-1024', date: '2024-05-20', guest: 'Room 402', total: '$342.50', status: 'Paid', method: 'Card' },
  { id: 'INV-1023', date: '2024-05-20', guest: 'Walk-in', total: '$89.20', status: 'Unpaid', method: 'Cash' },
  { id: 'INV-1022', date: '2024-05-19', guest: 'Table 6 (Large Group)', total: '$850.00', status: 'Paid', method: 'Corporate' },
  { id: 'INV-1021', date: '2024-05-19', guest: 'Alexander Pierce', total: '$210.00', status: 'Refunded', method: 'Card' },
  { id: 'INV-1020', date: '2024-05-18', guest: 'Elena Gilbert', total: '$145.00', status: 'Paid', method: 'Card' },
];

export const InvoicesPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Financial Records</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Billing & Invoices</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Revenue (Today)', value: '$4,230.50', icon: DollarSign, change: '+15%' },
          { label: 'Average Check', value: '$82.40', icon: CreditCard, change: '+2.4%' },
          { label: 'Outstanding Bills', value: '$1,120.00', icon: FileText, change: '4 Items' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground italic">{stat.change}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</span>
              <span className="text-3xl font-light text-foreground">{stat.value}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="bg-card border-border h-10 pl-10 text-sm w-80 focus-visible:ring-primary" placeholder="Search invoices, guests..." />
          </div>
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            <Filter className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">Invoice ID</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Date</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Guest / Entity</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Amount</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Method</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Status</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-[11px] text-muted-foreground py-4 pl-6">{inv.id}</TableCell>
                <TableCell className="text-[12px]">{inv.date}</TableCell>
                <TableCell className="text-[13px] font-medium">{inv.guest}</TableCell>
                <TableCell className="text-[13px] font-bold text-foreground">{inv.total}</TableCell>
                <TableCell className="text-[11px] font-mono text-muted-foreground uppercase">{inv.method}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[9px] uppercase tracking-tighter border-none px-2 py-0 h-5",
                    inv.status === 'Paid' ? 'bg-blue-500/10 text-blue-400' : 
                    inv.status === 'Unpaid' ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'
                  )}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
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

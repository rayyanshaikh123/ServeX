import { useMemo } from "react";
import { Card } from "../../components/ui/card";
import { FileText, Download, Search, Filter, Printer, MoreVertical, CreditCard, DollarSign } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { cn } from "../../lib/utils";
import { useOrders } from "../../hooks";
import { generateInvoice } from "../../lib/endpoints/orders";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const InvoicesPage = () => {
  const { data, isLoading, isError } = useOrders();

  const orders = useMemo(() => data?.items ?? [], [data]);
  const todayTotal = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter((order) => new Date(order.created_at || '').toDateString() === today)
      .reduce((acc, order) => acc + order.total, 0);
  }, [orders]);

  const averageCheck = useMemo(() => {
    if (!orders.length) return 0;
    const total = orders.reduce((acc, order) => acc + order.total, 0);
    return total / orders.length;
  }, [orders]);

  const outstanding = useMemo(() => orders.filter((order) => order.status !== 'paid'), [orders]);

  const invoiceMutation = useMutation({
    mutationFn: generateInvoice,
    onSuccess: (invoice) => {
      if (invoice.file_url) {
        window.open(invoice.file_url, '_blank');
        toast.success('Invoice generated.');
        return;
      }
      toast.success('Invoice generated.');
    },
    onError: () => toast.error('Failed to generate invoice.'),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Financial Records</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Billing & Invoices</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Revenue (Today)', value: todayTotal.toFixed(2), icon: DollarSign, change: isLoading ? 'Loading' : 'Today' },
          { label: 'Average Check', value: averageCheck.toFixed(2), icon: CreditCard, change: isLoading ? 'Loading' : 'All orders' },
          { label: 'Outstanding Bills', value: `${outstanding.length}`, icon: FileText, change: 'Open' },
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
        {isError && (
          <div className="p-4 text-[12px] text-destructive">Orders are currently unavailable.</div>
        )}
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
            {orders.map((order) => {
              const created = order.created_at ? new Date(order.created_at) : null;
              const status = order.status?.toLowerCase();
              return (
                <TableRow key={order.id} className="border-border hover:bg-muted/20">
                  <TableCell className="font-mono text-[11px] text-muted-foreground py-4 pl-6">{order.id.slice(-8)}</TableCell>
                  <TableCell className="text-[12px]">{created ? created.toLocaleDateString() : '--'}</TableCell>
                  <TableCell className="text-[13px] font-medium">{order.table_id || 'Walk-in'}</TableCell>
                  <TableCell className="text-[13px] font-bold text-foreground">{order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-[11px] font-mono text-muted-foreground uppercase">{order.currency}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[9px] uppercase tracking-tighter border-none px-2 py-0 h-5",
                      status === 'paid' ? 'bg-blue-500/10 text-blue-400' : 
                      status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'
                    )}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => invoiceMutation.mutate(order.id)}
                        disabled={invoiceMutation.isPending}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

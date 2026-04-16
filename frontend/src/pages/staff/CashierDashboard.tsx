import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { CreditCard, Banknote, Search, Clock, Receipt, Calculator, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ScrollArea } from "../../components/ui/scroll-area";
import { cn } from "../../lib/utils";

const transactions = [
  { id: 'TX-402', table: 'T-02', amount: 145.80, method: 'Card', time: '10:15 AM' },
  { id: 'TX-401', table: 'T-06', amount: 82.40, method: 'Cash', time: '10:02 AM' },
  { id: 'TX-400', table: 'T-11', amount: 210.00, method: 'Card', time: '09:45 AM' },
];

export const CashierDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Financial Terminal</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Cashier Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Intake', value: '$2,482.00', icon: Calculator, color: 'text-primary' },
          { label: 'Card Volume', value: '$1,840.40', icon: CreditCard, color: 'text-blue-400' },
          { label: 'Cash Reserve', value: '$641.60', icon: Banknote, color: 'text-emerald-400' },
          { label: 'Transactions', value: '42', icon: Receipt, color: 'text-muted-foreground' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</span>
            </div>
            <span className="text-2xl font-light text-foreground">{stat.value}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Recent Settlements</span>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                   <Input placeholder="Search ledger..." className="bg-muted/10 border-border h-8 pl-9 text-[11px] focus-visible:ring-primary" />
                </div>
              </div>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="py-4 pl-6 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Reference</TableHead>
                    <TableHead className="py-4 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Table</TableHead>
                    <TableHead className="py-4 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Amount</TableHead>
                    <TableHead className="py-4 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Method</TableHead>
                    <TableHead className="py-4 pr-6 text-right font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-border hover:bg-muted/20">
                      <TableCell className="py-4 pl-6 text-[13px] font-mono text-muted-foreground">{tx.id}</TableCell>
                      <TableCell className="text-[13px] font-medium">{tx.table}</TableCell>
                      <TableCell className="text-[14px] font-mono font-bold">${tx.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter h-5 px-1.5 border-border bg-muted/20">
                          {tx.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right text-[11px] text-muted-foreground italic">{tx.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-card border-border shadow-none rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Shift Security</span>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-[12px] text-muted-foreground">Drawer Count (Open)</span>
                    <span className="text-[13px] font-mono">$500.00</span>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-[12px] text-muted-foreground">Variance (Observed)</span>
                    <span className="text-[13px] font-mono text- emerald-500">$0.00</span>
                 </div>
                 <Button className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-[10px] uppercase font-bold tracking-widest">
                    Request X-Report
                 </Button>
              </div>
           </Card>

           <Card className="bg-card border-primary/20 border-dashed border-2 shadow-none rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <Clock className="w-8 h-8 text-primary/40 mb-3" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">EOD Closeout</span>
              <p className="text-[11px] text-muted-foreground italic mt-2">Final settlement authorized in 04h 32m</p>
           </Card>
        </div>
      </div>
    </div>
  );
};

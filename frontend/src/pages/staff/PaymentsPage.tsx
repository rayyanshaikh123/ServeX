import { Card, CardContent } from "../../components/ui/card";
import { CreditCard, Banknote, Search, Clock, CheckCircle2, MoreVertical, Receipt, ArrowRight, User } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { cn } from "../../lib/utils";

const openTickets = [
  { id: 'TIC-1024', table: 'Table 2', customer: 'Sarah Wilson', total: 145.80, status: 'Ready to Pay', time: '45m ago' },
  { id: 'TIC-1025', table: 'Table 4', customer: 'Alexander Pierce', total: 82.40, status: 'Active', time: '12m ago' },
  { id: 'TIC-1026', table: 'Table 12', customer: 'Julianne Moore', total: 210.00, status: 'Ready to Pay', time: '1h 12m ago' },
  { id: 'TIC-1027', table: 'Bar 3', customer: 'Direct Guest', total: 54.20, status: 'Active', time: '5m ago' },
];

export const PaymentsPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Checkout & Transactions</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Open Tickets</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search table or ticket..." className="bg-card border-border border h-10 pl-10 text-xs focus-visible:ring-primary" />
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-border text-[10px] uppercase font-bold tracking-widest h-10">
             Print Batch
           </Button>
           <Button className="bg-primary hover:bg-primary/90 text-white text-[10px] uppercase font-bold tracking-widest h-10 px-6">
             Quick Checkout
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tickets Table */}
        <Card className="lg:col-span-2 bg-card border-border shadow-none rounded-lg overflow-hidden">
           <div className="p-5 border-b border-border flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Unpaid Sessions</span>
              <Badge variant="outline" className="text-[9px] h-5 border-none bg-primary/10 text-primary">04 Active</Badge>
           </div>
           <Table>
             <TableHeader className="bg-muted/30">
               <TableRow className="border-border hover:bg-transparent">
                 <TableHead className="py-4 pl-6 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Reference</TableHead>
                 <TableHead className="py-4 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Origin</TableHead>
                 <TableHead className="py-4 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total</TableHead>
                 <TableHead className="py-4 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</TableHead>
                 <TableHead className="py-4 pr-6 text-right font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Action</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {openTickets.map((ticket) => (
                 <TableRow key={ticket.id} className="border-border hover:bg-muted/20">
                   <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                         <span className="text-[13px] font-medium text-foreground">{ticket.id}</span>
                         <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ticket.time}
                         </span>
                      </div>
                   </TableCell>
                   <TableCell>
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground ring-1 ring-border">
                            {ticket.table.charAt(0)}
                         </div>
                         <span className="text-[13px] font-medium">{ticket.table}</span>
                      </div>
                   </TableCell>
                   <TableCell className="text-[14px] font-mono font-bold text-foreground">
                      ${ticket.total.toFixed(2)}
                   </TableCell>
                   <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[9px] uppercase border-none px-2 h-5",
                        ticket.status === 'Ready to Pay' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                      )}>
                        {ticket.status}
                      </Badge>
                   </TableCell>
                   <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary/80 transition-all">
                        Process <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </Card>

        {/* Right Column: Processing Panel */}
        <div className="space-y-6">
           <Card className="bg-card border-border shadow-none rounded-lg p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Payment Methods</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/30 text-primary transition-all hover:bg-primary hover:text-white group">
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Card</span>
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-muted/20 border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground">
                    <Banknote className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Cash</span>
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-muted/20 border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground">
                    <User className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Charge Room</span>
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-muted/20 border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground">
                    <History className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Split</span>
                 </button>
              </div>

              <div className="space-y-4 pt-6 border-t border-border/50">
                 <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-border">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Pending Amount</span>
                    <span className="text-2xl font-light text-foreground">$0.00</span>
                 </div>
                 <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-[11px] uppercase font-bold tracking-widest" disabled>
                    Close Session
                 </Button>
              </div>
           </Card>

           <Card className="bg-card border-border shadow-none rounded-lg p-5 flex items-center justify-between group cursor-pointer hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-3">
                 <Receipt className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                 <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-widest font-bold">Print Receipt History</span>
                    <span className="text-[10px] text-muted-foreground italic">Batch #402-May16</span>
                 </div>
              </div>
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
           </Card>
        </div>
      </div>
    </div>
  );
};

const History = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="m12 7v5l4 2"/>
  </svg>
);

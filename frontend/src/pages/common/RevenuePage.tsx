import { Card, CardContent } from "../../components/ui/card";
import { DollarSign, CreditCard, ShoppingBag, Banknote, ArrowUpRight, ArrowDownRight, Download, Filter, Search } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const monthlyRevenue = [
  { month: 'Jan', recurring: 12000, once: 4000 },
  { month: 'Feb', recurring: 15000, once: 3000 },
  { month: 'Mar', recurring: 18000, once: 5000 },
  { month: 'Apr', recurring: 16500, once: 4200 },
  { month: 'May', recurring: 19000, once: 6000 },
  { month: 'Jun', recurring: 22000, once: 7500 },
];

const transactions = [
  { id: 'TXN-9042', guest: 'Sarah Wilson', date: 'May 20, 14:30', amount: '$124.50', status: 'Completed', method: 'Card' },
  { id: 'TXN-9041', guest: 'Mike Johnson', date: 'May 20, 13:15', amount: '$45.00', status: 'Completed', method: 'Cash' },
  { id: 'TXN-9040', guest: 'Corporate Booking', date: 'May 19, 21:00', amount: '$850.00', status: 'Pending', method: 'Transfer' },
  { id: 'TXN-9039', guest: 'Julianne Moore', date: 'May 19, 19:45', amount: '$210.00', status: 'Completed', method: 'Card' },
  { id: 'TXN-9038', guest: 'Alexander Pierce', date: 'May 19, 18:30', amount: '$54.20', status: 'Refunded', method: 'Card' },
];

export const RevenuePage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Financial Sovereignty</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Revenue Stream</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Gross Revenue', value: '$242,500', change: '+$14k this month', icon: DollarSign },
          { label: 'Net Profit', value: '$84,120', change: '+8.4%', icon: Banknote },
          { label: 'Average Check', value: '$82.40', change: '+2.1%', icon: CreditCard },
          { label: 'Outstanding', value: '$4,500', change: '12 accounts', icon: ShoppingBag },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <Download className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</span>
              <span className="text-3xl font-light text-foreground">{stat.value}</span>
              <span className="text-[10px] font-mono text-emerald-500 italic mt-2">{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-none rounded-lg p-6">
           <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Revenue Composition</span>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-primary" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Subscriptions</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-muted-foreground/30" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">One-time</span>
                 </div>
              </div>
           </div>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#141417', borderRadius: '4px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '11px' }}/>
                  <Bar dataKey="recurring" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="once" stackId="a" fill="#27272a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <Card className="bg-card border-border shadow-none rounded-lg p-6 overflow-hidden">
           <div className="flex items-center justify-between mb-6">
             <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Quick Invoicing</span>
           </div>
           <div className="space-y-4">
              <div className="p-4 bg-muted/20 border border-border rounded-lg">
                 <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-2">Next Payout</span>
                 <span className="text-xl font-light text-foreground">$12,450.00</span>
                 <p className="text-[11px] text-muted-foreground mt-2">Expected by May 24, 2024</p>
              </div>
              <div className="space-y-3">
                 <Button className="w-full bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold">Generate Invoice</Button>
                 <Button variant="outline" className="w-full border-border h-10 text-[10px] uppercase tracking-widest font-bold">Billing Settings</Button>
              </div>
           </div>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Recent Transactions</span>
          <div className="flex items-center gap-3">
             <Search className="w-4 h-4 text-muted-foreground" />
             <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">Reference</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Guest</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Date</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Amount</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-[11px] text-muted-foreground py-4 pl-6">{txn.id}</TableCell>
                <TableCell className="text-[13px] font-medium">{txn.guest}</TableCell>
                <TableCell className="text-[12px] text-muted-foreground">{txn.date}</TableCell>
                <TableCell className="text-[13px] font-bold text-foreground">{txn.amount}</TableCell>
                <TableCell className="pr-6 text-right">
                  <span className={cn(
                    "text-[10px] uppercase px-1.5 py-0.5 rounded font-bold border",
                    txn.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                    txn.status === 'Pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                  )}>
                    {txn.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

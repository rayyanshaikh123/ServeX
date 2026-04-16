import { Card, CardContent } from "../../components/ui/card";
import { TrendingUp, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Download, Filter, Layers, Zap } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Line, Bar } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

const performanceData = [
  { month: 'Jan', projected: 45000, actual: 48000, margin: 22 },
  { month: 'Feb', projected: 42000, actual: 39000, margin: 18 },
  { month: 'Mar', projected: 48000, actual: 52000, margin: 25 },
  { month: 'Apr', projected: 50000, actual: 55000, margin: 28 },
  { month: 'May', projected: 55000, actual: 61000, margin: 30 },
  { month: 'Jun', projected: 60000, actual: 68000, margin: 32 },
];

const profitCenters = [
  { channel: 'Dining Room', share: '62%', growth: '+12%', type: 'Direct' },
  { channel: 'Digital Orders', share: '18%', growth: '+45%', type: 'Digital' },
  { channel: 'Private Events', share: '12%', growth: '+8%', type: 'Contract' },
  { channel: 'Bar Services', share: '08%', growth: '+15%', type: 'Direct' },
];

export const RevenueStreamPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Capital Management</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Revenue Stream</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            Quarterly View
          </Button>
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            Target Metrics
          </Button>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold px-6">
          <Download className="w-4 h-4 mr-2" />
          Financial Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Annual Projected', value: '$720k', sub: 'Target: $800k', icon: Layers },
          { label: 'EBITDA Margin', value: '32.4%', sub: 'Industry Avg: 24%', icon: Zap },
          { label: 'Liquidity Index', value: '1.8x', sub: 'Stable Flow', icon: PieChart },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-none rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</span>
                <span className="text-2xl font-light text-foreground">{stat.value}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
               <span className="text-[10px] text-muted-foreground italic">{stat.sub}</span>
               <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Actual vs. Projected Variance</span>
            <div className="flex gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-primary" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Actual</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-muted-foreground/30" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Projected</span>
               </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a"/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#141417', borderRadius: '4px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '11px' }}/>
                <Bar dataKey="actual" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="projected" stroke="#71717a" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card border-border shadow-none rounded-lg p-6">
           <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-8 block">Yield Optimization Breakdown</span>
           <div className="space-y-6">
              {profitCenters.map((item, i) => (
                <div key={i} className="flex flex-col gap-2 group cursor-pointer">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className="text-[13px] font-medium text-foreground">{item.channel}</span>
                         <Badge variant="outline" className="text-[8px] uppercase tracking-tighter h-4 px-1">{item.type}</Badge>
                      </div>
                      <span className="text-[12px] font-mono font-bold text-primary">{item.share}</span>
                   </div>
                   <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 group-hover:bg-primary transition-all transition-duration-500" style={{ width: item.share }} />
                   </div>
                   <div className="flex items-center justify-end gap-1">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-bold">{item.growth}</span>
                   </div>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Historical Performance Ledger</span>
          <Button variant="ghost" className="text-[10px] text-primary font-bold uppercase tracking-widest p-0 h-auto">Download PDF Archive</Button>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">Quarter</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Gross Revenue</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Op. Expense</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Net ROI</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { q: 'Q1 2024', rev: '$142,500', exp: '$102,000', roi: '28.4%', var: '+4.2%' },
              { q: 'Q4 2023', rev: '$189,200', exp: '$124,500', roi: '34.2%', var: '+8.1%' },
              { q: 'Q3 2023', rev: '$112,000', exp: '$94,000', roi: '16.1%', var: '-1.2%' },
            ].map((entry, i) => (
              <TableRow key={i} className="border-border hover:bg-muted/20">
                <TableCell className="font-mono text-[11px] text-muted-foreground py-4 pl-6">{entry.q}</TableCell>
                <TableCell className="text-[13px] font-medium">{entry.rev}</TableCell>
                <TableCell className="text-[12px] text-muted-foreground">{entry.exp}</TableCell>
                <TableCell className="text-[13px] font-bold text-foreground">{entry.roi}</TableCell>
                <TableCell className="pr-6 text-right font-mono text-[10px] text-emerald-500">{entry.var}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

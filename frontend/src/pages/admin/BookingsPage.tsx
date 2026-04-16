import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Calendar, Plus, Search, Filter, Clock, MapPin, User } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { cn } from "../../lib/utils";
import { useBookings } from "../../hooks";

export const BookingsPage = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useBookings();

  const bookings = useMemo(() => {
    const list = data?.items ?? [];
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter((booking) =>
      booking.guest_name.toLowerCase().includes(term) ||
      booking.table_id.toLowerCase().includes(term)
    );
  }, [data, search]);

  const peakHour = useMemo(() => {
    if (!data?.items?.length) return '--';
    const counts = new Map<number, number>();
    data.items.forEach((booking) => {
      const hour = new Date(booking.start_time).getHours();
      counts.set(hour, (counts.get(hour) ?? 0) + 1);
    });
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return best ? `${best[0]}:00` : '--';
  }, [data]);

  const dailyReach = useMemo(() => {
    if (!data?.items?.length) return 0;
    return data.items.reduce((acc, booking) => acc + booking.party_size, 0);
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Reservations & Guests</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Booking Register</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="bg-card border-border h-10 pl-10 text-sm w-80 focus-visible:ring-primary"
              placeholder="Search guests or tables..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            <Filter className="w-4 h-4 mr-2" />
            Select Date
          </Button>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold px-6">
          <Plus className="w-4 h-4 mr-2" />
          Create Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card border-border shadow-none rounded-lg overflow-hidden">
           <div className="p-6 border-b border-border">
             <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Upcoming Appointments</span>
           </div>
           {isError && (
             <div className="p-4 text-[12px] text-destructive">Bookings are currently unavailable.</div>
           )}
           <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">Guest</TableHead>
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Schedule</TableHead>
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Size</TableHead>
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Table</TableHead>
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const start = new Date(booking.start_time);
                const dateLabel = start.toLocaleDateString();
                const timeLabel = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                <TableRow key={booking.id} className="border-border hover:bg-muted/20">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                         {booking.guest_name.charAt(0)}
                       </div>
                       <span className="text-[13px] font-medium">{booking.guest_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[12px]">{dateLabel}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{timeLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[12px]">{booking.party_size} Pax</TableCell>
                  <TableCell className="text-[12px] font-bold text-primary">{booking.table_id}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Badge variant="outline" className={cn(
                      "text-[9px] uppercase tracking-tighter border-none px-2 py-0 h-5",
                      booking.status === 'reserved' ? 'bg-blue-500/10 text-blue-400' : 
                      booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'
                    )}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </Card>

        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">Quick Insights</span>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                     <Clock className="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[13px] font-medium">Peak Hour</span>
                     <span className="text-[11px] text-muted-foreground">{isLoading ? 'Loading...' : peakHour}</span>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                     <User className="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[13px] font-medium">Daily Reach</span>
                     <span className="text-[11px] text-muted-foreground">{isLoading ? 'Loading...' : `${dailyReach} guests`}</span>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                     <MapPin className="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[13px] font-medium">Terrace Util</span>
                     <span className="text-[11px] text-muted-foreground">{isLoading ? 'Loading...' : `${bookings.length} active`}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 block">Calendar View</span>
               <div className="aspect-square bg-muted/20 border border-border rounded-lg flex items-center justify-center text-center p-4">
                 <span className="text-[10px] uppercase tracking-widest text-muted-foreground italic font-medium">Datepicker Widget Placeholder</span>
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

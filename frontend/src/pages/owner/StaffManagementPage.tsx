import { Card } from "../../components/ui/card";
import { Users, UserPlus, Search, Filter, Shield, MoreVertical, Trash2, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";

const adminList = [
  { id: '1', name: 'Sarah Wilson', role: 'ADMIN', email: 'sarah@servex.com', status: 'Active', joinDate: 'Jan 2024' },
  { id: '2', name: 'David Miller', role: 'ADMIN', email: 'david@servex.com', status: 'Active', joinDate: 'Dec 2023' },
  { id: '3', name: 'Anna Taylor', role: 'ADMIN', email: 'anna@servex.com', status: 'Active', joinDate: 'Apr 2024' },
];

export const StaffManagementPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Human Resources</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Admin Management</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="bg-card border-border h-10 pl-10 text-sm w-80 focus-visible:ring-primary" placeholder="Search admins..." />
          </div>
          <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-10 px-4">
            <Filter className="w-4 h-4 mr-2" />
            Roles
          </Button>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white h-10 text-[10px] uppercase tracking-widest font-bold px-6">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Admins</span>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-3xl font-light text-foreground">{adminList.length}</span>
          <p className="text-[10px] text-emerald-500 mt-2 italic">Active management accounts</p>
        </Card>
        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Privileged Access</span>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-3xl font-light text-foreground">{adminList.length}</span>
          <p className="text-[10px] text-muted-foreground mt-2 italic">Admin role designation</p>
        </Card>
        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admins Active</span>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-3xl font-light tracking-tight text-primary">{adminList.length}</span>
          <p className="text-[10px] text-muted-foreground mt-2 italic">Currently active</p>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">Member</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Designation</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Shift Assignment</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Access Level</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Status</TableHead>
              <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminList.map((member) => (
              <TableRow key={member.id} className="border-border hover:bg-muted/20">
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold ring-1 ring-border">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-foreground">{member.name}</span>
                      <span className="text-[11px] text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[10px] border-none px-2 py-0 h-5",
                    member.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">Full Access</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={cn("w-2 h-2 rounded-full", i <= 3 ? "bg-primary" : "bg-muted")} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", member.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500')} />
                      <span className="text-[12px]">{member.status}</span>
                   </div>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="bg-card border-border shadow-none rounded-lg p-6">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">Join Velocity</span>
            <div className="space-y-4">
               {adminList.slice(0, 3).map((member, i) => (
                 <div key={i} className="flex items-center justify-between text-sm">
                   <span className="text-muted-foreground">{member.name}</span>
                   <span className="font-mono text-[11px] text-primary">{member.joinDate}</span>
                 </div>
               ))}
            </div>
         </Card>
         <Card className="bg-card border-border shadow-none rounded-lg p-6 flex items-center justify-center text-center">
            <div className="flex flex-col items-center">
               <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Audit Complete</span>
               <p className="text-[11px] text-muted-foreground mt-1 italic">All privileged credentials verified as of 09:00 today.</p>
            </div>
         </Card>
      </div>
    </div>
  );
};

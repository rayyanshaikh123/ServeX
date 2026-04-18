import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Users, UserPlus, Search, Filter, Shield, MoreVertical, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import api from "../../lib/api";

interface StaffUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  restaurant_id: string;
}

export const StaffManagementPage = () => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

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
            <Input
              className="bg-card border-border h-10 pl-10 text-sm w-80 focus-visible:ring-primary"
              placeholder="Search admins..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Users</span>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-3xl font-light text-foreground">{users.length}</span>
          <p className="text-[10px] text-emerald-500 mt-2 italic">All accounts in restaurant</p>
        </Card>
        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Privileged Access</span>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-3xl font-light text-foreground">{adminCount}</span>
          <p className="text-[10px] text-muted-foreground mt-2 italic">Admin role designation</p>
        </Card>
        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Active Accounts</span>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-3xl font-light tracking-tight text-primary">{activeCount}</span>
          <p className="text-[10px] text-muted-foreground mt-2 italic">Currently active</p>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pl-6">Member</TableHead>
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Role</TableHead>
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Joined</TableHead>
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4">Status</TableHead>
                <TableHead className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-4 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((member) => (
                <TableRow key={member.id} className="border-border hover:bg-muted/20">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold ring-1 ring-border">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-foreground">{member.email.split('@')[0]}</span>
                        <span className="text-[11px] text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px] border-none px-2 py-0 h-5 uppercase",
                      member.role === 'owner' ? 'bg-amber-500/10 text-amber-500' :
                      member.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">
                    {member.created_at ? new Date(member.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", member.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500')} />
                      <span className="text-[12px]">{member.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-card border-border shadow-none rounded-lg p-6">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6 block">Recent Joins</span>
          <div className="space-y-4">
            {users.slice(0, 5).map((member, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{member.email}</span>
                <span className="font-mono text-[11px] text-primary">
                  {member.created_at ? new Date(member.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-card border-border shadow-none rounded-lg p-6 flex items-center justify-center text-center">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Audit Complete</span>
            <p className="text-[11px] text-muted-foreground mt-1 italic">
              {activeCount} of {users.length} accounts currently active.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

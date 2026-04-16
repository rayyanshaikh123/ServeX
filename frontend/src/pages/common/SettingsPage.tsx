import { Card, CardContent } from "../../components/ui/card";
import { User, Bell, Lock, Shield, Sliders, Monitor, Globe, Mail, Save, RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";

export const SettingsPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">System Preferences</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">Account Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <nav className="space-y-1">
            {[
              { label: 'Profile Context', icon: User, active: true },
              { label: 'Notifications', icon: Bell },
              { label: 'Security & Keys', icon: Shield },
              { label: 'Display Terminal', icon: Monitor },
              { label: 'Global Rules', icon: Globe },
              { label: 'System Logs', icon: Sliders },
            ].map((item, i) => (
              <button
                key={i}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-[11px] uppercase tracking-widest font-bold transition-all rounded-md",
                  item.active 
                    ? "bg-primary text-white" 
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-9 space-y-8">
          {/* Profile Section */}
          <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
             <div className="p-6 border-b border-border flex items-center justify-between">
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Identity Configuration</span>
               <Badge variant="outline" className="text-[9px] h-5 border-primary/20 bg-primary/5 text-primary">Owner Verified</Badge>
             </div>
             <CardContent className="p-8 space-y-6">
               <div className="flex items-center gap-8 mb-8 pb-8 border-b border-border">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-serif italic text-foreground border border-border">
                    {user?.name?.[0]}
                  </div>
                  <div className="flex flex-col gap-3">
                     <Button variant="outline" className="border-border text-[10px] uppercase tracking-widest font-bold h-9">Reload Archive</Button>
                     <p className="text-[11px] text-muted-foreground italic">Preferred format: JPG/PNG. Maximum size: 2MB.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Legal Name</label>
                    <Input defaultValue={user?.name} className="bg-background border-border h-11 text-xs focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Primary Email</label>
                    <Input defaultValue={user?.email} className="bg-background border-border h-11 text-xs focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Role Designation</label>
                    <Input value={user?.role} disabled className="bg-muted/20 border-border h-11 text-xs cursor-not-allowed opacity-60" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Terminal ID</label>
                    <Input value={`UID-${user?.id}`} disabled className="bg-muted/20 border-border h-11 text-xs cursor-not-allowed opacity-60 font-mono" />
                  </div>
               </div>
             </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="bg-card border-border shadow-none rounded-lg overflow-hidden">
             <div className="p-6 border-b border-border">
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">System Behaviors</span>
             </div>
             <CardContent className="p-8 space-y-8">
                {[
                  { label: 'Real-time Telemetry', desc: 'Allow background data synchronization for local nodes.', enabled: true },
                  { label: 'Desktop Notifications', desc: 'Enable native OS alerts for critical system logs.', enabled: false },
                  { label: 'Analytical Reports', desc: 'Receive weekly comprehensive performance summaries via email.', enabled: true },
                  { label: 'Advanced UI Kit', desc: 'Enable experimental motion and layout patterns.', enabled: true },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-foreground">{pref.label}</span>
                      <p className="text-[11px] text-muted-foreground italic">{pref.desc}</p>
                    </div>
                    <Switch defaultChecked={pref.enabled} />
                  </div>
                ))}
             </CardContent>
          </Card>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-4">
             <Button variant="ghost" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground">
               <RotateCcw className="w-4 h-4 mr-2" />
               Reset to Default
             </Button>
             <Button className="bg-primary hover:bg-primary/90 text-white px-8 h-11 text-[11px] uppercase tracking-widest font-bold">
               <Save className="w-4 h-4 mr-2" />
               Apply Changes
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

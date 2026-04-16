import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { MapPin, Globe, Utensils, Check, ArrowLeft, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { useNavigate } from "react-router-dom";

export const CreateRestaurantPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    type: 'Fine Dining'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Portfolio Expansion</h1>
          <h2 className="text-3xl font-serif italic text-foreground tracking-tight">Onboard New Establishment</h2>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
           <Card className="bg-card border-border shadow-none rounded-xl overflow-hidden">
              <div className="p-8 border-b border-border bg-muted/20">
                 <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Property Registration</span>
              </div>
              <CardContent className="p-8 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Establishment Name</label>
                       <Input 
                         placeholder="e.g. ServeX Executive Lounge" 
                         className="bg-background border-border h-12 text-sm focus-visible:ring-primary" 
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Cuisine / Concept</label>
                       <Input 
                         placeholder="e.g. Modern French" 
                         className="bg-background border-border h-12 text-sm focus-visible:ring-primary" 
                         value={formData.type}
                         onChange={(e) => setFormData({...formData, type: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Geometric Address</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                       <Input 
                         placeholder="123 Financial District, Node 01" 
                         className="bg-background border-border h-12 pl-12 text-sm focus-visible:ring-primary" 
                         value={formData.address}
                         onChange={(e) => setFormData({...formData, address: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Operational Description</label>
                    <Textarea 
                      placeholder="Define the vision and core operational directives for this location..." 
                      className="bg-background border-border min-h-[150px] text-sm focus-visible:ring-primary resize-none leading-relaxed italic"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                 </div>
              </CardContent>
           </Card>

           <div className="flex items-center justify-end gap-4">
              <Button variant="ghost" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Draft Session</Button>
              <Button className="bg-primary hover:bg-primary/90 text-white px-10 h-12 text-[11px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20">
                 Authorize & Deploy
                 <Check className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="bg-card border-border shadow-none rounded-xl p-8 border-dashed border-2 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 transition-all group">
              <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                 <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">Brand Artifact</span>
              <p className="text-[11px] text-muted-foreground mt-2 max-w-[150px]">Upload primary brand identifier or establishment logo.</p>
           </Card>

           <Card className="bg-card border-border shadow-none rounded-xl p-8 space-y-6">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Preview Context</span>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary/60" />
                    <span className="text-[12px] text-muted-foreground italic">Global Visibility: Public</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Utensils className="w-4 h-4 text-primary/60" />
                    <span className="text-[12px] text-muted-foreground italic">Terminal Mode: Retail/Dining</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Waves } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f6f4ee,_#f3efe7_40%,_#efe9df_100%)] text-[#1f1c17]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12">
        <header className="flex items-center justify-between">
          <div className="text-2xl font-serif italic tracking-tight">ServeX</div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-[11px] uppercase tracking-[0.3em]">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-black text-white hover:bg-black/90 text-[11px] uppercase tracking-[0.3em]">Register</Button>
            </Link>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-12 pt-16 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em]">
              <Sparkles className="h-3 w-3" />
              multi-tenant restaurant intelligence
            </div>
            <h1 className="text-4xl font-serif italic leading-tight tracking-tight sm:text-5xl">
              Orchestrate service, inventory, and payments in a single control room.
            </h1>
            <p className="max-w-xl text-sm text-[#50473f]">
              ServeX is the operational brain for modern restaurants. Automate table flow, monitor revenue,
              and let your team act with clarity using role-based dashboards and live updates.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register">
                <Button className="h-12 rounded-full bg-black px-6 text-[11px] uppercase tracking-[0.3em] text-white hover:bg-black/90 shadow-xl shadow-black/10">
                  Business Owner
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="h-12 rounded-full border-black/20 px-6 text-[11px] uppercase tracking-[0.3em]">
                  Staff Login
                </Button>
              </Link>
            </div>

            <div className="pt-8 border-t border-black/5">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-black/40 mb-4">Experience the floor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 bg-white/50 border-black/5 hover:border-black/20 transition-all group cursor-pointer">
                  <Link to="/menu/69e284b3e319a96bd0b43a6d/T1" className="block">
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <span className="text-[11px] font-bold uppercase tracking-widest text-[#1f1c17]">Guest Menu</span>
                         <span className="text-[10px] text-black/40">Demo: Table 01</span>
                       </div>
                       <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-black group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4" />
                       </Button>
                    </div>
                  </Link>
                </Card>
                <Card className="p-4 bg-white/50 border-black/5 hover:border-black/20 transition-all group cursor-pointer">
                  <Link to="/admin" className="block">
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <span className="text-[11px] font-bold uppercase tracking-widest text-[#1f1c17]">Staff Dashboard</span>
                         <span className="text-[10px] text-black/40">Operation Center</span>
                       </div>
                       <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-black group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4" />
                       </Button>
                    </div>
                  </Link>
                </Card>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-[#ffcf6f]/60 blur-2xl" />
            <div className="absolute -right-6 bottom-10 h-24 w-24 rounded-full bg-[#9bc1ff]/60 blur-2xl" />
            <div className="rounded-3xl border border-black/10 bg-white/70 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
              <div className="space-y-6">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Secure RBAC Core',
                    body: 'Owner/admin roles keep data scoped to each restaurant and enforce safe access paths.',
                  },
                  {
                    icon: Waves,
                    title: 'Real-time operations',
                    body: 'Tables, orders, and bookings update instantly to keep service synchronized.',
                  },
                  {
                    icon: Sparkles,
                    title: 'AI-ready workflow',
                    body: 'Chat, analytics, and forecasting work out of the box with your FastAPI backend.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">{item.title}</h3>
                      <p className="text-xs text-[#50473f]">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

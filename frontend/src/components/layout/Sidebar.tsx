import React, { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Package, 
  Table as TableIcon, 
  Calendar, 
  CreditCard,
  UtensilsCrossed,
  PlusCircle,
  BrainCircuit,
  Store,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useRestaurants, useSwitchRestaurant } from '../../hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Sidebar = () => {
  const { user, logout, activeRestaurantId, setActiveRestaurantId, setTokens } = useAuthStore();
  const isOwner = user?.role?.toUpperCase() === 'OWNER';
  const { data: restaurantsData } = useRestaurants(isOwner);
  const switchMutation = useSwitchRestaurant();

  const restaurants = useMemo(() => restaurantsData?.items ?? [], [restaurantsData]);
  const activeRestaurant = useMemo(
    () => restaurants.find((item) => item.id === activeRestaurantId),
    [restaurants, activeRestaurantId]
  );

  useEffect(() => {
    if (!isOwner) return;
    if (activeRestaurantId) return;
    if (restaurants.length === 0) return;
    setActiveRestaurantId(restaurants[0].id);
  }, [activeRestaurantId, isOwner, restaurants, setActiveRestaurantId]);

  const get_dashboard_link = () => {
    if (user?.role === 'OWNER') return '/owner';
    if (user?.role === 'ADMIN') return '/admin';
    return '/login';
  };

  const navGroups = [
    {
      label: 'Overview',
      links: [
        { to: get_dashboard_link(), icon: LayoutDashboard, label: user?.role === 'ADMIN' ? 'Command Center' : 'Dashboard' },
        { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
        { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
        { to: '/revenue', icon: TrendingUp, label: 'Revenue' },
      ]
    },
    {
      label: user?.role === 'OWNER' ? 'Portfolio' : 'Administration',
      links: user?.role === 'OWNER' ? [
        { to: '/owner/users', icon: Users, label: 'Admin Management' },
        { to: '/owner/revenue', icon: TrendingUp, label: 'Revenue Stream' },
        { to: '/owner/intelligence', icon: BrainCircuit, label: 'Strategy Node' },
        { to: '/owner/restaurants/new', icon: PlusCircle, label: 'Add Establishment' },
      ] : user?.role === 'ADMIN' ? [
        { to: '/admin/inventory', icon: Package, label: 'Inventory' },
        { to: '/admin/tables', icon: TableIcon, label: 'Table Grid' },
        { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
        { to: '/admin/invoices', icon: CreditCard, label: 'Billing' },
        { to: '/admin/orders/new', icon: UtensilsCrossed, label: 'New Order' },
        { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
      ] : []
    }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-card border-r border-border flex flex-col p-6 z-50">
      <div className="font-serif italic text-2xl mb-12 tracking-tight text-foreground flex flex-col gap-2">
        ServeX
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-auto p-0 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary flex items-center justify-start gap-2 bg-transparent border-none outline-none cursor-pointer">
                <Store className="w-3 h-3" />
                {activeRestaurant?.name || activeRestaurantId || 'Select Venue'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card border-border">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">My Establishments</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {restaurants.length === 0 ? (
                <DropdownMenuItem className="text-xs italic text-muted-foreground">
                  No restaurants found
                </DropdownMenuItem>
              ) : (
                restaurants.map((restaurant) => (
                  <DropdownMenuItem
                    key={restaurant.id}
                    onClick={async () => {
                      if (restaurant.id === activeRestaurantId) return;
                      try {
                        const tokens = await switchMutation.mutateAsync(restaurant.id);
                        setTokens(tokens.access_token, tokens.refresh_token);
                        setActiveRestaurantId(restaurant.id);
                        toast.success(`Switched to ${restaurant.name}`);
                      } catch (error) {
                        toast.error('Failed to switch restaurant.');
                      }
                    }}
                    className="text-xs italic cursor-pointer"
                  >
                    {restaurant.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <nav className="flex-1 space-y-8">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-0">
              {group.label}
            </span>
            <div className="space-y-1">
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-0 py-2 text-sm transition-colors relative group",
                      isActive 
                        ? "text-foreground font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute -left-0 w-1.5 h-1.5 rounded-full bg-primary mr-3" style={{ marginLeft: '-12px' }} />}
                      <span className={cn(isActive ? "pl-3" : "pl-0")}>{link.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-6 border-t border-border mt-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold ring-1 ring-border">
            {user?.name?.[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">{user?.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>
        <div className="space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center w-full py-2 text-sm transition-colors relative group",
                isActive 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute -left-0 w-1.5 h-1.5 rounded-full bg-primary mr-3" style={{ marginLeft: '-12px' }} />}
                <span className={cn(isActive ? "pl-3" : "pl-0")}>Settings</span>
              </>
            )}
          </NavLink>
          <button 
            onClick={logout}
            className="flex items-center w-full py-2 text-sm text-muted-foreground hover:text-destructive transition-colors group"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

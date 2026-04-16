import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import api from '../lib/api';
import { registerRequest } from '../lib/auth';
import { ApiUser, Role, User } from '../types';

export const Register = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setTokens, setActiveRestaurantId } = useAuthStore();

  const buildDisplayName = (value: string) => {
    const prefix = value.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
    if (!prefix) return 'Owner';
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const tokens = await registerRequest(restaurantName, email, password);
      setTokens(tokens.access_token, tokens.refresh_token);

      const { data: me } = await api.get<ApiUser>('/api/users/me');
      const user: User = {
        id: me.id,
        restaurant_id: me.restaurant_id,
        email: me.email,
        role: 'OWNER' as Role,
        name: buildDisplayName(me.email),
        is_active: me.is_active,
        created_at: me.created_at,
      };

      setUser(user);
      setActiveRestaurantId(me.restaurant_id);
      navigate('/owner');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setError(detail || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl rounded-xl overflow-hidden relative">
        <div className="p-8 text-center border-b border-border">
          <div className="flex justify-center mb-6">
            <UtensilsCrossed className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-serif italic text-foreground mb-2">ServeX</h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Owner Registration</p>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Restaurant Name</label>
                <Input
                  type="text"
                  placeholder="ServeX Lounge"
                  className="bg-background border-border h-12 text-sm focus-visible:ring-primary"
                  value={restaurantName}
                  onChange={(event) => setRestaurantName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Owner Email</label>
                <Input
                  type="email"
                  placeholder="owner@servex.com"
                  className="bg-background border-border h-12 text-sm focus-visible:ring-primary"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pl-1">Secure Key</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-background border-border h-12 text-sm focus-visible:ring-primary"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-[11px] uppercase tracking-[0.2em] font-bold"
            >
              {isLoading ? 'Creating...' : 'Create Owner Account'}
            </Button>
          </form>

          <div className="pt-4 border-t border-border text-center text-[11px] text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

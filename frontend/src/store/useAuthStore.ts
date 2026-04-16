import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { logoutRequest } from '../lib/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  activeRestaurantId: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setTokens: (token: string | null, refreshToken: string | null) => void;
  setActiveRestaurantId: (id: string | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      activeRestaurantId: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      setActiveRestaurantId: (id) => set({ activeRestaurantId: id }),
      logout: async () => {
        const refreshToken = get().refreshToken;
        if (refreshToken) {
          try {
            await logoutRequest(refreshToken);
          } catch (error) {
            console.warn('Logout request failed', error);
          }
        }
        set({ user: null, token: null, refreshToken: null, activeRestaurantId: null });
      },
    }),
    {
      name: 'servex-auth-storage',
    }
  )
);

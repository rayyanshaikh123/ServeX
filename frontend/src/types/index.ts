export type ApiRole = 'owner' | 'admin';
export type Role = 'OWNER' | 'ADMIN';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiUser {
  id: string;
  restaurant_id: string;
  email: string;
  role: ApiRole;
  is_active: boolean;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  description?: string;
}

export interface User {
  id: string;
  restaurant_id: string;
  email: string;
  name?: string;
  role: Role;
  restaurantIds?: string[]; // Owners can own multiple
  is_active?: boolean;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  growth: number;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: Array<{ menuItemId: string; quantity: number }>;
  total: number;
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'PAID';
  createdAt: string;
}

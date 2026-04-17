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
  restaurant_id: string;
  name: string;
  capacity: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  isVeg: boolean;
  spiceLevel: string;
  category: string;
  image_url?: string;
  tags: string[];
  stock: number;
  low_stock_threshold: number;
  time_to_cook: number;
  embedding_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id?: string;
  items: Array<{
    menu_item_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
    instructions?: string;
    time_to_cook: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'closed';
  created_at: string;
  updated_at: string;
}

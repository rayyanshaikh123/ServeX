import api from '../api';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  isVeg: boolean;
  spiceLevel: string;
  tags: string[];
  stock: number;
  low_stock_threshold: number;
  embedding_status?: string | null;
  embedding_error?: string | null;
  embedding_updated_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MenuListResponse {
  items: MenuItem[];
  total: number;
}

export interface MenuCreateRequest {
  name: string;
  price: number;
  isVeg: boolean;
  spiceLevel: string;
  tags?: string[];
  stock?: number;
  low_stock_threshold?: number | null;
}

export interface MenuUpdateRequest {
  name?: string;
  price?: number;
  isVeg?: boolean;
  spiceLevel?: string;
  tags?: string[];
  stock?: number;
  low_stock_threshold?: number | null;
}

export const listMenu = async (params?: {
  low_stock_only?: boolean;
  limit?: number;
  skip?: number;
}): Promise<MenuListResponse> => {
  const { data } = await api.get<MenuListResponse>('/api/inventory/menu', { params });
  return data;
};

export const getMenuItem = async (itemId: string): Promise<MenuItem> => {
  const { data } = await api.get<MenuItem>(`/api/inventory/menu/${itemId}`);
  return data;
};

export const createMenuItem = async (payload: MenuCreateRequest): Promise<MenuItem> => {
  const { data } = await api.post<MenuItem>('/api/inventory/menu', payload);
  return data;
};

export const updateMenuItem = async (
  itemId: string,
  payload: MenuUpdateRequest
): Promise<MenuItem> => {
  const { data } = await api.patch<MenuItem>(`/api/inventory/menu/${itemId}`, payload);
  return data;
};

export const deleteMenuItem = async (itemId: string): Promise<void> => {
  await api.delete(`/api/inventory/menu/${itemId}`);
};

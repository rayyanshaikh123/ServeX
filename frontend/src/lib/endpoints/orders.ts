import api from '../api';

export interface OrderItemCreateRequest {
  menu_item_id: string;
  quantity: number;
}

export interface OrderCreateRequest {
  table_id?: string | null;
  items: OrderItemCreateRequest[];
  notes?: string | null;
}

export interface OrderStatusUpdateRequest {
  status: string;
}

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface OrderEntity {
  id: string;
  restaurant_id: string;
  table_id?: string | null;
  status: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrderListResponse {
  items: OrderEntity[];
  total: number;
}

export interface InvoiceResponse {
  id: string;
  restaurant_id: string;
  order_id: string;
  invoice_number: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  storage_backend: string;
  file_path?: string | null;
  file_url?: string | null;
  created_at: string;
}

export const listOrders = async (params?: {
  status?: string;
  limit?: number;
  skip?: number;
}): Promise<OrderListResponse> => {
  const { data } = await api.get<OrderListResponse>('/api/orders', { params });
  return data;
};

export const getOrder = async (orderId: string): Promise<OrderEntity> => {
  const { data } = await api.get<OrderEntity>(`/api/orders/${orderId}`);
  return data;
};

export const createOrder = async (payload: OrderCreateRequest): Promise<OrderEntity> => {
  const { data } = await api.post<OrderEntity>('/api/orders', payload);
  return data;
};

export const updateOrderStatus = async (
  orderId: string,
  payload: OrderStatusUpdateRequest
): Promise<OrderEntity> => {
  const { data } = await api.post<OrderEntity>(`/api/orders/${orderId}/status`, payload);
  return data;
};

export const generateInvoice = async (orderId: string): Promise<InvoiceResponse> => {
  const { data } = await api.post<InvoiceResponse>(`/api/orders/${orderId}/invoice`);
  return data;
};

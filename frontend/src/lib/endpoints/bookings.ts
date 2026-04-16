import api from '../api';

export interface BookingEntity {
  id: string;
  restaurant_id: string;
  table_id: string;
  guest_name: string;
  party_size: number;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BookingListResponse {
  items: BookingEntity[];
  total: number;
}

export interface BookingCreateRequest {
  table_id: string;
  guest_name: string;
  party_size: number;
  start_time: string;
  duration_minutes?: number | null;
  notes?: string | null;
}

export const listBookings = async (params?: {
  start?: string;
  end?: string;
  limit?: number;
  skip?: number;
}): Promise<BookingListResponse> => {
  const { data } = await api.get<BookingListResponse>('/api/bookings', { params });
  return data;
};

export const createBooking = async (payload: BookingCreateRequest): Promise<BookingEntity> => {
  const { data } = await api.post<BookingEntity>('/api/bookings', payload);
  return data;
};

export const cancelBooking = async (bookingId: string): Promise<BookingEntity> => {
  const { data } = await api.post<BookingEntity>(`/api/bookings/${bookingId}/cancel`);
  return data;
};

import api from '../api';
import { AuthTokens } from '../../types';

export interface RestaurantEntity {
  id: string;
  name: string;
  timezone: string;
  status: string;
  owner_id?: string | null;
  created_at: string;
}

export interface RestaurantListResponse {
  items: RestaurantEntity[];
  total: number;
}

export const listRestaurants = async (): Promise<RestaurantListResponse> => {
  const { data } = await api.get<RestaurantListResponse>('/api/restaurants');
  return data;
};

export const switchRestaurant = async (restaurantId: string): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/api/restaurants/switch', {
    restaurant_id: restaurantId,
  });
  return data;
};

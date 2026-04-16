import axios from 'axios';
import { AuthTokens } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const authApi = axios.create({
  baseURL: API_BASE_URL,
});

export const loginRequest = async (
  email: string,
  password: string
): Promise<AuthTokens> => {
  const { data } = await authApi.post<AuthTokens>('/api/auth/login', {
    email,
    password,
  });
  return data;
};

export const registerRequest = async (
  restaurantName: string,
  email: string,
  password: string
): Promise<AuthTokens> => {
  const { data } = await authApi.post<AuthTokens>('/api/auth/register', {
    restaurant_name: restaurantName,
    email,
    password,
  });
  return data;
};

export const refreshRequest = async (refreshToken: string): Promise<AuthTokens> => {
  const { data } = await authApi.post<AuthTokens>('/api/auth/refresh', {
    refresh_token: refreshToken,
  });
  return data;
};

export const logoutRequest = async (refreshToken: string): Promise<void> => {
  await authApi.post('/api/auth/logout', {
    refresh_token: refreshToken,
  });
};

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { refreshRequest } from './auth';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const tokens = await refreshRequest(refreshToken);
    setTokens(tokens.access_token, tokens.refresh_token);
    return tokens.access_token;
  } catch (error) {
    toast.error('Session expired. Please sign in again.');
    await logout();
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & {
      _retry?: boolean;
      skipAuthRefresh?: boolean;
    }) | undefined;

    if (!original || original.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }

      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
    }

    if (error.response?.status === 403) {
      const detail = (error.response.data as { detail?: string } | undefined)?.detail;
      toast.error(detail || 'Access denied.');
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default api;

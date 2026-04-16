import api from '../api';
import { ApiRole, ApiUser } from '../../types';

export interface UserCreateRequest {
  email: string;
  password: string;
  role: ApiRole;
}

export const fetchMe = async (): Promise<ApiUser> => {
  const { data } = await api.get<ApiUser>('/api/users/me');
  return data;
};

export const createUser = async (payload: UserCreateRequest): Promise<ApiUser> => {
  const { data } = await api.post<ApiUser>('/api/users', payload);
  return data;
};

import api from '../api';

export interface TableEntity {
  id: string;
  restaurant_id: string;
  name: string;
  capacity: number;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TableListResponse {
  items: TableEntity[];
  total: number;
}

export interface TableCreateRequest {
  name: string;
  capacity: number;
}

export interface TableUpdateRequest {
  name?: string;
  capacity?: number;
  status?: string;
}

export const listTables = async (params?: {
  limit?: number;
  skip?: number;
}): Promise<TableListResponse> => {
  const { data } = await api.get<TableListResponse>('/api/tables', { params });
  return data;
};

export const getTable = async (tableId: string): Promise<TableEntity> => {
  const { data } = await api.get<TableEntity>(`/api/tables/${tableId}`);
  return data;
};

export const createTable = async (payload: TableCreateRequest): Promise<TableEntity> => {
  const { data } = await api.post<TableEntity>('/api/tables', payload);
  return data;
};

export const updateTable = async (
  tableId: string,
  payload: TableUpdateRequest
): Promise<TableEntity> => {
  const { data } = await api.patch<TableEntity>(`/api/tables/${tableId}`, payload);
  return data;
};

export const deleteTable = async (tableId: string): Promise<void> => {
  await api.delete(`/api/tables/${tableId}`);
};

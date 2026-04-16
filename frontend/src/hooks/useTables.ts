import { useQuery } from '@tanstack/react-query';
import { listTables } from '../lib/endpoints/tables';
import { queryKeys } from './queryKeys';

export const useTables = (params?: { limit?: number; skip?: number }) => {
  return useQuery({
    queryKey: queryKeys.tables(params as Record<string, unknown> | undefined),
    queryFn: () => listTables(params),
  });
};

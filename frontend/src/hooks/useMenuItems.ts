import { useQuery } from '@tanstack/react-query';
import { listMenu } from '../lib/endpoints/inventory';
import { queryKeys } from './queryKeys';

export const useMenuItems = (params?: {
  low_stock_only?: boolean;
  limit?: number;
  skip?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.menu(params as Record<string, unknown> | undefined),
    queryFn: () => listMenu(params),
  });
};

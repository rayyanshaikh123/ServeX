import { useQuery } from '@tanstack/react-query';
import { listOrders } from '../lib/endpoints/orders';
import { queryKeys } from './queryKeys';

export const useOrders = (params?: { status?: string; limit?: number; skip?: number }) => {
  return useQuery({
    queryKey: queryKeys.orders(params as Record<string, unknown> | undefined),
    queryFn: () => listOrders(params),
  });
};

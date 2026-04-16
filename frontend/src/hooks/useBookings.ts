import { useQuery } from '@tanstack/react-query';
import { listBookings } from '../lib/endpoints/bookings';
import { queryKeys } from './queryKeys';

export const useBookings = (params?: {
  start?: string;
  end?: string;
  limit?: number;
  skip?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.bookings(params as Record<string, unknown> | undefined),
    queryFn: () => listBookings(params),
  });
};

import { useQuery } from '@tanstack/react-query';
import { listRestaurants } from '../lib/endpoints/restaurants';
import { queryKeys } from './queryKeys';

export const useRestaurants = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.restaurants,
    queryFn: listRestaurants,
    enabled,
  });
};

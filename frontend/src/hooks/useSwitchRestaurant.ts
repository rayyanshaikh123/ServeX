import { useMutation, useQueryClient } from '@tanstack/react-query';
import { switchRestaurant } from '../lib/endpoints/restaurants';
import { queryKeys } from './queryKeys';

export const useSwitchRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: switchRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsSummary });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'menu'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

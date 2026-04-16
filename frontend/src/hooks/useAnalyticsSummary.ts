import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsSummary } from '../lib/endpoints/analytics';
import { queryKeys } from './queryKeys';

export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: queryKeys.analyticsSummary,
    queryFn: fetchAnalyticsSummary,
  });
};

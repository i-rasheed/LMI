import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { fetchMarketById } from '../services/markets.service';

export function useMarketDetail(marketId: string) {
  return useQuery({
    queryKey: queryKeys.markets.detail(marketId),
    queryFn: () => fetchMarketById(marketId),
    enabled: Boolean(marketId),
  });
}

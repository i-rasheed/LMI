import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { fetchPriceCompare } from '../services/prices.service';
import {
  CompareFilters,
  CompareSort,
} from '../types/prices';
import { UserLocation } from './useLocation';

interface UsePriceCompareOptions {
  productId: string;
  sort: CompareSort;
  location?: UserLocation | null;
  filters?: CompareFilters;
  enabled?: boolean;
}

export function usePriceCompare({
  productId,
  sort,
  location,
  filters,
  enabled = true,
}: UsePriceCompareOptions) {
  return useQuery({
    queryKey: queryKeys.prices.compare(
      productId,
      sort,
      location?.lat,
      location?.lng,
      filters as Record<string, unknown> | undefined,
    ),
    queryFn: () =>
      fetchPriceCompare(productId, {
        sort,
        lat: location?.lat,
        lng: location?.lng,
        filters,
      }),
    enabled: enabled && Boolean(productId),
  });
}

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { fetchMarkets, fetchNearbyMarkets } from '../services/markets.service';
import { UserLocation } from './useLocation';

interface UseMarketsOptions {
  location?: UserLocation | null;
  enabled?: boolean;
}

export function useMarkets({ location, enabled = true }: UseMarketsOptions) {
  const useNearby = location != null;

  return useQuery({
    queryKey: useNearby
      ? queryKeys.markets.nearby(location.lat, location.lng)
      : queryKeys.markets.list({ alphabetical: true }),
    queryFn: () =>
      useNearby
        ? fetchNearbyMarkets({
            lat: location.lat,
            lng: location.lng,
            radiusKm: 50,
            limit: 20,
          })
        : fetchMarkets({ limit: 20 }),
    enabled,
  });
}

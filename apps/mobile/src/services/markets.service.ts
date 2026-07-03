import { apiRequest } from '../lib/api';
import { MarketListItem } from '../types/catalogue';
import { MarketDetail } from '../types/prices';

export function fetchMarkets(params?: {
  area?: string;
  limit?: number;
}): Promise<MarketListItem[]> {
  const search = new URLSearchParams();
  if (params?.area) {
    search.set('area', params.area);
  }
  if (params?.limit) {
    search.set('limit', String(params.limit));
  }
  const query = search.toString();
  return apiRequest<MarketListItem[]>(`/markets${query ? `?${query}` : ''}`);
}

export function fetchNearbyMarkets(params: {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
}): Promise<MarketListItem[]> {
  const search = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
  });
  if (params.radiusKm != null) {
    search.set('radius_km', String(params.radiusKm));
  }
  if (params.limit != null) {
    search.set('limit', String(params.limit));
  }
  return apiRequest<MarketListItem[]>(`/markets/nearby?${search.toString()}`);
}

export function fetchMarketById(id: string): Promise<MarketDetail> {
  return apiRequest<MarketDetail>(`/markets/${id}`);
}

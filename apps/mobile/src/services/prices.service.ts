import { apiRequest } from '../lib/api';
import {
  CompareFilters,
  CompareResponse,
  CompareSort,
  PriceHistoryResponse,
} from '../types/prices';
import {
  MarketAverageResponse,
  SubmissionResponse,
  SubmitPayload,
} from '../types/submit';

export function fetchPriceCompare(
  productId: string,
  params: {
    sort?: CompareSort;
    lat?: number;
    lng?: number;
    filters?: CompareFilters;
  } = {},
): Promise<CompareResponse> {
  const search = new URLSearchParams();
  if (params.sort) {
    search.set('sort', params.sort);
  }
  if (params.lat != null) {
    search.set('lat', String(params.lat));
  }
  if (params.lng != null) {
    search.set('lng', String(params.lng));
  }
  if (params.filters?.area) {
    search.set('area', params.filters.area);
  }
  if (params.filters?.maxDistanceKm != null) {
    search.set('max_distance_km', String(params.filters.maxDistanceKm));
  }
  if (params.filters?.updatedWithinHours != null) {
    search.set('updated_within_hours', String(params.filters.updatedWithinHours));
  }

  const query = search.toString();
  return apiRequest<CompareResponse>(
    `/prices/${productId}/compare${query ? `?${query}` : ''}`,
  );
}

export function fetchPriceHistory(productId: string): Promise<PriceHistoryResponse> {
  return apiRequest<PriceHistoryResponse>(`/prices/${productId}/history`);
}

export function fetchMarketAverage(params: {
  productId: string;
  marketId: string;
  unit: string;
}): Promise<MarketAverageResponse> {
  const search = new URLSearchParams({
    productId: params.productId,
    marketId: params.marketId,
    unit: params.unit,
  });
  return apiRequest<MarketAverageResponse>(`/prices/average?${search.toString()}`);
}

export function submitPrice(payload: SubmitPayload): Promise<SubmissionResponse> {
  return apiRequest<SubmissionResponse>('/prices', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePrice(
  submissionId: string,
  payload: SubmitPayload,
): Promise<SubmissionResponse> {
  return apiRequest<SubmissionResponse>(`/prices/${submissionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

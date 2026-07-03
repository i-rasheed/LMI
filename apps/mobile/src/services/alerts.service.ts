import { apiRequest } from '../lib/api';
import { AlertThreshold, PriceAlertItem } from '../types/favourites-alerts';

export function fetchAlerts(): Promise<PriceAlertItem[]> {
  return apiRequest<PriceAlertItem[]>('/alerts');
}

export function createAlert(payload: {
  productId: string;
  thresholdPercentage: AlertThreshold;
  isActive?: boolean;
}): Promise<PriceAlertItem> {
  return apiRequest<PriceAlertItem>('/alerts', {
    method: 'POST',
    body: JSON.stringify({
      productId: payload.productId,
      thresholdPercentage: payload.thresholdPercentage,
      isActive: payload.isActive ?? true,
    }),
  });
}

export function updateAlert(
  id: string,
  payload: {
    thresholdPercentage?: AlertThreshold;
    isActive?: boolean;
  },
): Promise<PriceAlertItem> {
  return apiRequest<PriceAlertItem>(`/alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAlert(id: string): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(`/alerts/${id}`, {
    method: 'DELETE',
  });
}

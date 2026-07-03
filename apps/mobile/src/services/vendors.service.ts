import { apiRequest } from '../lib/api';
import {
  ClaimStatusResponse,
  StallClaimPayload,
  UpdateVendorProductPayload,
  VendorAnalyticsSummary,
  VendorDashboardResponse,
  VendorProductItem,
  VendorProductPayload,
} from '../types/vendor';
import { CheckoutSession, SubscriptionPlan } from '../types/subscriptions';

export function fetchClaimStatus(): Promise<ClaimStatusResponse> {
  return apiRequest<ClaimStatusResponse>('/vendors/claim/status');
}

export function submitStallClaim(
  payload: StallClaimPayload,
): Promise<ClaimStatusResponse> {
  return apiRequest<ClaimStatusResponse>('/vendors/claim', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resubmitStallClaim(
  payload: StallClaimPayload,
): Promise<ClaimStatusResponse> {
  return apiRequest<ClaimStatusResponse>('/vendors/claim', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function fetchVendorDashboard(): Promise<VendorDashboardResponse> {
  return apiRequest<VendorDashboardResponse>('/vendors/me/dashboard');
}

export function fetchVendorSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return apiRequest<SubscriptionPlan[]>('/vendors/subscription/plans');
}

export function initializeVendorSubscription(payload: {
  planId: string;
  callbackUrl?: string;
}): Promise<CheckoutSession> {
  return apiRequest<CheckoutSession>('/vendors/subscription/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchVendorAnalytics(): Promise<VendorAnalyticsSummary> {
  return apiRequest<VendorAnalyticsSummary>('/vendors/analytics');
}

export function recordVendorAnalyticsEvent(payload: {
  vendorStallId: string;
  eventType: 'profile_view' | 'product_click';
  productId?: string;
}): Promise<{ recorded: boolean }> {
  return apiRequest('/vendors/analytics/event', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchVendorProducts(): Promise<VendorProductItem[]> {
  return apiRequest<VendorProductItem[]>('/vendors/products');
}

export function addVendorProduct(
  payload: VendorProductPayload,
): Promise<VendorProductItem> {
  return apiRequest('/vendors/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateVendorProduct(
  id: string,
  payload: UpdateVendorProductPayload,
): Promise<VendorProductItem> {
  return apiRequest(`/vendors/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

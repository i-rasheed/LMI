import { apiRequest } from '../lib/api';
import {
  AccountWarning,
  AdminDashboardSummary,
  AdminFlagAction,
  FlagQueueItem,
  FlagReviewDetail,
} from '../types/flags';
import {
  AdminClaimAction,
  ClaimQueueItem,
  ClaimReviewDetail,
} from '../types/vendor';

export function fetchAdminDashboard(): Promise<AdminDashboardSummary> {
  return apiRequest<AdminDashboardSummary>('/admin/dashboard');
}

export function fetchFlagQueue(params?: {
  marketId?: string;
  productId?: string;
  minFlagCount?: number;
}): Promise<FlagQueueItem[]> {
  const search = new URLSearchParams();
  if (params?.marketId) {
    search.set('market_id', params.marketId);
  }
  if (params?.productId) {
    search.set('product_id', params.productId);
  }
  if (params?.minFlagCount != null) {
    search.set('min_flag_count', String(params.minFlagCount));
  }
  const query = search.toString();
  return apiRequest<FlagQueueItem[]>(
    `/admin/flags${query ? `?${query}` : ''}`,
  );
}

export function fetchFlagReview(id: string): Promise<FlagReviewDetail> {
  return apiRequest<FlagReviewDetail>(`/admin/flags/${id}`);
}

export function applyFlagAction(
  reviewId: string,
  action: AdminFlagAction,
): Promise<{ reviewId: string; submissionId: string; action: string; submissionStatus: string }> {
  return apiRequest(`/admin/flags/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify(action),
  });
}

export function fetchPendingWarnings(): Promise<AccountWarning[]> {
  return apiRequest<AccountWarning[]>('/users/me/warnings');
}

export function acknowledgeWarning(warningId: string): Promise<{ acknowledged: boolean }> {
  return apiRequest(`/users/me/warnings/${warningId}/acknowledge`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function fetchClaimQueue(): Promise<ClaimQueueItem[]> {
  return apiRequest<ClaimQueueItem[]>('/admin/claims');
}

export function fetchClaimReview(id: string): Promise<ClaimReviewDetail> {
  return apiRequest<ClaimReviewDetail>(`/admin/claims/${id}`);
}

export function applyClaimAction(
  claimId: string,
  action: AdminClaimAction,
): Promise<{ claimId: string; claimStatus: string; action: string }> {
  return apiRequest(`/admin/claims/${claimId}`, {
    method: 'PATCH',
    body: JSON.stringify(action),
  });
}

import { apiRequest } from '../lib/api';
import {
  CheckoutSession,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../types/subscriptions';

export function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return apiRequest<SubscriptionPlan[]>('/subscriptions/plans');
}

export function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  return apiRequest<SubscriptionStatus>('/subscriptions/me');
}

export function initializeSubscription(payload: {
  planId: string;
  callbackUrl?: string;
}): Promise<CheckoutSession> {
  return apiRequest<CheckoutSession>('/subscriptions/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

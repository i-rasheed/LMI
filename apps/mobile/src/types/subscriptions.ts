export interface SubscriptionPlan {
  id: string;
  planType: string;
  name: string;
  amountKobo: number;
  amountNaira: number;
  billingInterval: 'monthly' | 'annual' | string;
  paystackPlanCode: string | null;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  subscription: {
    id: string;
    planId: string;
    status: string;
    billingInterval: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export interface CheckoutSession {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

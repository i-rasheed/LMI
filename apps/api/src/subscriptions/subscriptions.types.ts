export interface SubscriptionPlanRow {
  id: string;
  plan_type: string;
  name: string;
  amount_kobo: number;
  billing_interval: string;
  paystack_plan_code: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  vendor_stall_id: string | null;
  plan_id: string;
  subscription_type: string;
  status: string;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  paystack_email_token: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlanRow | SubscriptionPlanRow[];
}

export interface SubscriptionPlanItem {
  id: string;
  planType: string;
  name: string;
  amountKobo: number;
  amountNaira: number;
  billingInterval: string;
  paystackPlanCode: string | null;
}

export interface SubscriptionStatusResponse {
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

export interface PaystackInitializeResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaystackWebhookPayload {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    channel?: string;
    paid_at?: string;
    customer?: {
      customer_code?: string;
      email?: string;
    };
    subscription?: {
      subscription_code?: string;
      email_token?: string;
    };
    metadata?: {
      userId?: string;
      planId?: string;
      subscriptionType?: string;
      vendorStallId?: string;
    };
  };
}

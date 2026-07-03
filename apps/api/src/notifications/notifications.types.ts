export interface PushDeviceRow {
  id: string;
  user_id: string;
  expo_push_token: string;
  device_id: string | null;
  platform: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface PriceAlertEvaluationRow {
  id: string;
  user_id: string;
  product_id: string;
  threshold_percentage: number;
  is_active: boolean;
  last_known_price_naira: number | null;
  products: {
    id: string;
    name: string;
  } | Array<{
    id: string;
    name: string;
  }>;
}

export interface CurrentPriceSnapshot {
  product_id: string;
  market_id: string;
  price_naira: number;
  unit: string;
  markets: {
    id: string;
    name: string;
  } | Array<{
    id: string;
    name: string;
  }>;
}

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

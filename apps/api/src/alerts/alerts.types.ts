export interface PriceAlertItem {
  id: string;
  productId: string;
  thresholdPercentage: number;
  isActive: boolean;
  lastTriggeredAt: string | null;
  lastKnownPriceNaira: number | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    defaultUnit: string;
    photoUrl: string | null;
  };
}

export interface PriceAlertRow {
  id: string;
  product_id: string;
  threshold_percentage: number;
  is_active: boolean;
  last_triggered_at: string | null;
  last_known_price_naira: number | null;
  created_at: string;
  updated_at: string;
  products:
    | ProductJoinRow
    | ProductJoinRow[];
}

export interface ProductJoinRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  default_unit: string;
  photo_url: string | null;
}

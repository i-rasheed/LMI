export interface SavedProductSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  defaultUnit: string;
  photoUrl: string | null;
}

export interface FavouriteItem {
  id: string;
  productId: string;
  createdAt: string;
  product: SavedProductSummary;
}

export type AlertThreshold = 0 | 10 | 15 | 20;

export interface PriceAlertItem {
  id: string;
  productId: string;
  thresholdPercentage: AlertThreshold;
  isActive: boolean;
  lastTriggeredAt: string | null;
  lastKnownPriceNaira: number | null;
  createdAt: string;
  updatedAt: string;
  product: SavedProductSummary;
}

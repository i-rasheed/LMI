export interface MarketListItem {
  id: string;
  name: string;
  slug: string;
  area: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  categories: string[];
  distanceKm?: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  defaultUnit: string;
  photoUrl: string | null;
  matchScore?: number;
}

export interface TrendingProduct extends ProductListItem {
  searchCount: number;
}

export interface ProductCategorySummary {
  category: string;
  productCount: number;
}

export type ProductCategory =
  | 'vegetables'
  | 'grains'
  | 'protein'
  | 'spices'
  | 'oils'
  | 'fruits'
  | 'other';

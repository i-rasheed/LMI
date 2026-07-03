export interface ProductSearchRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  default_unit: string;
  allowed_units: string[];
  photo_url: string | null;
  rank: number;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  default_unit: string;
  allowed_units: string[];
  photo_url: string | null;
  is_active: boolean;
}

export interface TrendingProductRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  default_unit: string;
  photo_url: string | null;
  search_count: number | string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  defaultUnit: string;
  photoUrl: string | null;
}

export interface ProductSearchResult extends ProductListItem {
  allowedUnits: string[];
  matchScore: number;
}

export interface ProductDetailResponse extends ProductSearchResult {
  isActive: boolean;
}

export interface TrendingProduct extends ProductListItem {
  searchCount: number;
}

export interface ProductCategorySummary {
  category: string;
  productCount: number;
}

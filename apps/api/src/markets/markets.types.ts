export interface MarketRow {
  id: string;
  name: string;
  slug: string;
  area: string;
  description: string | null;
  latitude: number | string;
  longitude: number | string;
  opening_hours: Record<string, unknown>;
  photo_url: string | null;
  categories: string[];
  distance_km?: number | string | null;
}

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

export interface PopularPriceItem {
  productId: string;
  productName: string;
  productSlug: string;
  category: string;
  priceNaira: number;
  unit: string;
  submittedAt: string;
  submitterName: string;
  badgeLevel: string | null;
}

export interface VendorStallItem {
  id: string;
  stallName: string;
  description: string;
  isVerified: boolean;
  vendorTier: string | null;
  isPromoted: boolean;
}

export interface MarketDetailResponse extends MarketListItem {
  description: string | null;
  openingHours: Record<string, unknown>;
  popularPrices: PopularPriceItem[];
  vendorStalls: VendorStallItem[];
}

export interface NearbyMarketsQuery {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
}

export type CompareSort = 'cheapest' | 'freshest' | 'nearest';

export interface CompareFilters {
  area?: string;
  maxDistanceKm?: number;
  updatedWithinHours?: number;
}

export interface ComparePriceItem {
  id: string;
  submissionId: string;
  marketId: string;
  marketName: string;
  marketArea: string;
  marketSlug: string;
  latitude: number;
  longitude: number;
  priceNaira: number;
  unit: string;
  submittedAt: string;
  distanceKm?: number;
  source: string;
  status: string;
  vendorStallId: string | null;
  vendorStallName?: string | null;
  submitter: {
    id: string;
    displayName: string;
    badgeLevel: string | null;
    isVerifiedReporter: boolean;
  };
}

export interface CompareResponse {
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    defaultUnit: string;
    photoUrl: string | null;
  };
  prices: ComparePriceItem[];
  cheapest: {
    priceNaira: number;
    marketName: string;
    unit: string;
  } | null;
}

export interface PriceHistoryPoint {
  date: string;
  averagePriceNaira: number;
  sampleCount: number;
}

export interface PriceHistoryResponse {
  productId: string;
  points: PriceHistoryPoint[];
}

export interface MarketDetail {
  id: string;
  name: string;
  slug: string;
  area: string;
  description: string | null;
  latitude: number;
  longitude: number;
  openingHours: Record<string, unknown>;
  photoUrl: string | null;
  categories: string[];
  popularPrices: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    category: string;
    priceNaira: number;
    unit: string;
    submittedAt: string;
    submitterName: string;
    badgeLevel: string | null;
  }>;
  vendorStalls: Array<{
    id: string;
    stallName: string;
    description: string;
    isVerified: boolean;
    vendorTier: string | null;
    isPromoted: boolean;
  }>;
}

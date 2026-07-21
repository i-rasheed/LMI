export type CompareSort = 'cheapest' | 'freshest' | 'nearest';

export interface CompareQuery {
  sort?: CompareSort;
  lat?: number;
  lng?: number;
  area?: string;
  maxDistanceKm?: number;
  updatedWithinHours?: number;
}

export interface CurrentPriceRow {
  id: string;
  product_id: string;
  market_id: string;
  unit: string;
  price_naira: number;
  submission_id: string;
  submitter_id: string;
  source: string;
  vendor_stall_id: string | null;
  status: string;
  submitted_at: string;
  markets: {
    id: string;
    name: string;
    slug: string;
    area: string;
    latitude: number | string;
    longitude: number | string;
  };
  profiles: {
    id: string;
    display_name: string | null;
    current_badge_level: string | null;
    is_verified_reporter: boolean;
  };
  vendor_stalls?: {
    id: string;
    stall_name: string;
  } | null;
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
  submitter: {
    id: string;
    displayName: string;
    badgeLevel: string | null;
    isVerifiedReporter: boolean;
  };
  vendorStallName?: string | null;
}

export interface CompareProductSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  defaultUnit: string;
  photoUrl: string | null;
}

export interface CompareResponse {
  product: CompareProductSummary;
  prices: ComparePriceItem[];
  cheapest: {
    priceNaira: number;
    marketName: string;
    unit: string;
  } | null;
}

export interface VendorStallRow {
  id: string;
  stall_name: string;
  description: string;
  is_verified: boolean;
  vendor_tier: string | null;
  claim_status: string;
}

export interface FlagSubmissionResult {
  flagId: string;
  flagCount: number;
  escalated: boolean;
}

export interface SubmitPriceInput {
  marketId: string;
  productId: string;
  priceNaira: number;
  unit: string;
  photoUrl?: string;
  replacesSubmissionId?: string;
  confirmOutlier?: boolean;
}

export interface MarketAverageResponse {
  productId: string;
  marketId: string;
  unit: string;
  averageNaira: number | null;
  sampleCount: number;
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

export interface ReporterStatsSnapshot {
  acceptedSubmissionCount: number;
  currentBadgeLevel: string | null;
  nextBadgeLevel: string | null;
  submissionsUntilNextBadge: number | null;
  currentStreakDays: number;
}

export interface SubmissionResponse {
  submissionId: string;
  status: string;
  isAutoFlagged: boolean;
  productId: string;
  marketId: string;
  priceNaira: number;
  unit: string;
  photoUrl: string | null;
  submittedAt: string;
  reporterStats: ReporterStatsSnapshot;
}

export interface PriceSubmissionRow {
  id: string;
  product_id: string;
  market_id: string;
  submitter_id: string;
  price_naira: number;
  unit: string;
  photo_url: string | null;
  status: string;
  is_auto_flagged: boolean;
  replaces_submission_id: string | null;
  created_at: string;
}

export interface MarketPriceRow {
  id: string;
  price_naira: number;
  unit: string;
  submitted_at: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  profiles: {
    display_name: string | null;
    current_badge_level: string | null;
  };
}

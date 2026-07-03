export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface ClaimStatusResponse {
  hasClaim: boolean;
  id: string | null;
  stallName: string | null;
  marketId: string | null;
  marketName: string | null;
  marketArea: string | null;
  description: string | null;
  locationHint: string | null;
  categories: string[];
  photos: string[];
  claimStatus: ClaimStatus | null;
  rejectionReason: string | null;
  vendorTier: string | null;
  isVerified: boolean;
  reviewedAt: string | null;
  canPublishProducts: boolean;
}

export interface VendorDashboardResponse {
  stall: {
    id: string;
    stallName: string;
    marketName: string;
    marketArea: string;
    claimStatus: string;
    isVerified: boolean;
    vendorTier: string | null;
    description: string;
    locationHint: string;
    categories: string[];
    photos: string[];
  } | null;
  stats: {
    profileViews7d: number;
    productCount: number;
    productClicks7d: number | null;
  };
  canPublishProducts: boolean;
}

export interface VendorAnalyticsSummary {
  profileViews7d: number;
  productClicks7d: number;
  daily: Array<{
    date: string;
    profileViews: number;
    productClicks: number;
  }>;
}

export interface VendorProductItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  category: string;
  priceNaira: number;
  unit: string;
  photoUrl: string | null;
  status: string;
  isAvailableToday: boolean;
  updatedAt: string;
}

export interface ClaimQueueItem {
  id: string;
  stallName: string;
  marketId: string;
  marketName: string;
  marketArea: string;
  ownerId: string;
  ownerDisplayName: string | null;
  claimStatus: string;
  categories: string[];
  description: string;
  locationHint: string;
  photos: string[];
  createdAt: string;
}

export interface ClaimReviewDetail extends ClaimQueueItem {
  rejectionReason: string | null;
  reviewedAt: string | null;
}

export type AdminClaimAction =
  | { action: 'approve' }
  | { action: 'reject'; rejectionReason: string };

export interface StallClaimPayload {
  marketId: string;
  stallName: string;
  categories: string[];
  description: string;
  locationHint: string;
  photos?: string[];
}

export interface VendorProductPayload {
  productId: string;
  priceNaira: number;
  unit: string;
  isAvailableToday: boolean;
  photoUrl?: string;
}

export interface UpdateVendorProductPayload {
  priceNaira?: number;
  unit?: string;
  isAvailableToday?: boolean;
  photoUrl?: string;
}

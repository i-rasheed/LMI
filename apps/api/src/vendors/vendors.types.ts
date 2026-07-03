export interface VendorStallRow {
  id: string;
  owner_id: string;
  market_id: string;
  stall_name: string;
  description: string;
  location_hint: string;
  categories: string[];
  photos: string[];
  claim_status: string;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  vendor_tier: string | null;
  is_verified: boolean;
  profile_view_count_7d: number;
  created_at: string;
  updated_at: string;
}

export interface MarketJoinRow {
  id: string;
  name: string;
  slug: string;
  area: string;
}

export interface ProductJoinRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  default_unit: string;
  photo_url: string | null;
}

export interface VendorProductRow {
  id: string;
  product_id: string;
  market_id: string;
  price_naira: number;
  unit: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  products: ProductJoinRow | ProductJoinRow[];
}

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
  claimStatus: 'pending' | 'approved' | 'rejected' | null;
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

export interface VendorProductResult {
  id: string;
  productId: string;
  priceNaira: number;
  unit: string;
  photoUrl: string | null;
  status: string;
  isAvailableToday: boolean;
  updatedAt: string;
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

export interface ClaimActionResult {
  claimId: string;
  claimStatus: string;
  action: 'approve' | 'reject';
}

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

export function mapClaimStatus(
  row: VendorStallRow,
  market?: MarketJoinRow | null,
): ClaimStatusResponse {
  return {
    hasClaim: true,
    id: row.id,
    stallName: row.stall_name,
    marketId: row.market_id,
    marketName: market?.name ?? null,
    marketArea: market?.area ?? null,
    description: row.description,
    locationHint: row.location_hint,
    categories: row.categories ?? [],
    photos: row.photos ?? [],
    claimStatus: row.claim_status as ClaimStatusResponse['claimStatus'],
    rejectionReason: row.rejection_reason,
    vendorTier: row.vendor_tier,
    isVerified: row.is_verified,
    reviewedAt: row.reviewed_at,
    canPublishProducts: row.claim_status !== 'rejected',
  };
}

export function mapVendorProductItem(row: VendorProductRow): VendorProductItem {
  const product = first(row.products);

  return {
    id: row.id,
    productId: row.product_id,
    productName: product.name,
    productSlug: product.slug,
    category: product.category,
    priceNaira: row.price_naira,
    unit: row.unit,
    photoUrl: row.photo_url,
    status: row.status,
    isAvailableToday: row.status === 'live',
    updatedAt: row.updated_at,
  };
}

export function mapClaimQueueItem(
  row: VendorStallRow & {
    markets: MarketJoinRow | MarketJoinRow[];
    profiles: { id: string; display_name: string | null } | Array<{
      id: string;
      display_name: string | null;
    }>;
  },
): ClaimQueueItem {
  const market = first(row.markets);
  const owner = first(row.profiles);

  return {
    id: row.id,
    stallName: row.stall_name,
    marketId: row.market_id,
    marketName: market.name,
    marketArea: market.area,
    ownerId: row.owner_id,
    ownerDisplayName: owner.display_name,
    claimStatus: row.claim_status,
    categories: row.categories ?? [],
    description: row.description,
    locationHint: row.location_hint,
    photos: row.photos ?? [],
    createdAt: row.created_at,
  };
}

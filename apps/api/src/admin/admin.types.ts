export interface FlagQueueItem {
  id: string;
  submissionId: string;
  flagCount: number;
  escalatedAt: string;
  status: string;
  productId: string;
  productName: string;
  marketId: string;
  marketName: string;
  priceNaira: number;
  unit: string;
  reporter: {
    id: string;
    displayName: string;
    badgeLevel: string | null;
    isVerifiedReporter: boolean;
  };
}

export interface FlagDetailFlag {
  id: string;
  reason: string;
  comment: string | null;
  createdAt: string;
}

export interface FlagReviewDetail {
  id: string;
  submissionId: string;
  flagCount: number;
  escalatedAt: string;
  isResolved: boolean;
  submission: {
    id: string;
    productId: string;
    productName: string;
    marketId: string;
    marketName: string;
    priceNaira: number;
    unit: string;
    photoUrl: string | null;
    status: string;
    submittedAt: string;
    isAutoFlagged: boolean;
    autoFlagReason: string | null;
  };
  reporter: {
    id: string;
    displayName: string;
    badgeLevel: string | null;
    isVerifiedReporter: boolean;
    acceptedSubmissionCount: number;
  };
  flags: FlagDetailFlag[];
  reasonBreakdown: Record<string, number>;
  marketAverageNaira: number | null;
}

export interface FlagActionResult {
  reviewId: string;
  submissionId: string;
  action: string;
  submissionStatus: string;
}

export interface FlagSubmissionResult {
  flagId: string;
  flagCount: number;
  escalated: boolean;
}

export interface FlagReviewRow {
  id: string;
  submission_id: string;
  flag_count: number;
  escalated_at: string;
  is_resolved: boolean;
  price_submissions: SubmissionJoinRow | SubmissionJoinRow[];
}

export interface SubmissionJoinRow {
  id: string;
  product_id: string;
  market_id: string;
  submitter_id: string;
  price_naira: number;
  unit: string;
  photo_url: string | null;
  status: string;
  is_auto_flagged: boolean;
  auto_flag_reason: string | null;
  created_at: string;
  products: { id: string; name: string } | { id: string; name: string }[];
  markets: { id: string; name: string } | { id: string; name: string }[];
  profiles: ProfileJoinRow | ProfileJoinRow[];
}

export interface ProfileJoinRow {
  id: string;
  display_name: string | null;
  current_badge_level: string | null;
  is_verified_reporter: boolean;
}

export interface PriceFlagRow {
  id: string;
  reason: string;
  comment: string | null;
  created_at: string;
}

export interface PriceSubmissionRow {
  id: string;
  submitter_id: string;
  product_id: string;
  market_id: string;
  unit: string;
  price_naira: number;
  status: string;
  flag_count: number;
}

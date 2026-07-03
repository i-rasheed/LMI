export type FlagReason = 'incorrect_price' | 'outdated' | 'spam';

export interface FlagSubmissionResult {
  flagId: string;
  flagCount: number;
  escalated: boolean;
}

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
  flags: Array<{
    id: string;
    reason: string;
    comment: string | null;
    createdAt: string;
  }>;
  reasonBreakdown: Record<string, number>;
  marketAverageNaira: number | null;
}

export type AdminFlagAction =
  | { action: 'confirm' }
  | { action: 'edit'; priceNaira: number }
  | { action: 'remove' }
  | { action: 'warn'; title?: string; body?: string }
  | { action: 'ban' };

export interface AdminDashboardSummary {
  pendingFlags: number;
  pendingClaims: number;
  activeUsers7d: number | null;
}

export interface AccountWarning {
  id: string;
  title: string;
  body: string;
  relatedSubmissionId: string | null;
  createdAt: string;
}

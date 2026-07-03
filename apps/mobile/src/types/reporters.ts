export interface ReporterProfile {
  id: string;
  displayName: string;
  badgeLevel: string | null;
  isVerifiedReporter: boolean;
  acceptedSubmissionCount: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastSubmissionDate: string | null;
}

export interface ReporterLeaderboardItem extends ReporterProfile {
  rank: number;
  weeklySubmissionCount: number;
}

export interface ReporterSubmissionItem {
  id: string;
  productId: string;
  productName: string;
  marketId: string;
  marketName: string;
  priceNaira: number;
  unit: string;
  status: string;
  submittedAt: string;
}

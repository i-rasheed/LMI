import { PriceUnit, SubmitPriceInput } from '@lmi/shared';

export interface MarketAverageResponse {
  productId: string;
  marketId: string;
  unit: string;
  averageNaira: number | null;
  sampleCount: number;
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

export interface SubmitDraft {
  marketId: string | null;
  marketName: string | null;
  productId: string | null;
  productName: string | null;
  priceNaira: number | null;
  unit: PriceUnit | null;
  photoUri: string | null;
  photoUrl: string | null;
  replacesSubmissionId: string | null;
  confirmOutlier: boolean;
}

export type SubmitPayload = SubmitPriceInput;

export interface RecentMarketEntry {
  id: string;
  name: string;
  area: string;
}

export interface RecentProductEntry {
  id: string;
  name: string;
  defaultUnit: string;
}

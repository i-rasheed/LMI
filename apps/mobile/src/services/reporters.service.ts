import { apiRequest } from '../lib/api';
import {
  ReporterLeaderboardItem,
  ReporterProfile,
  ReporterSubmissionItem,
} from '../types/reporters';

export function fetchReporterLeaderboard(): Promise<ReporterLeaderboardItem[]> {
  return apiRequest<ReporterLeaderboardItem[]>('/reporters/leaderboard');
}

export function fetchReporterProfile(id: string): Promise<ReporterProfile> {
  return apiRequest<ReporterProfile>(`/reporters/${id}`);
}

export function fetchMyReporterSubmissions(): Promise<ReporterSubmissionItem[]> {
  return apiRequest<ReporterSubmissionItem[]>('/reporters/me/submissions');
}

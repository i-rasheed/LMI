import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ReporterLeaderboardItem,
  ReporterProfile,
  ReporterSubmissionItem,
} from './reporters.types';

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class ReportersService {
  constructor(private readonly supabase: SupabaseService) {}

  async getLeaderboard(limit = 20): Promise<ReporterLeaderboardItem[]> {
    const { data, error } = await this.supabase.db
      .from('reporter_stats')
      .select(
        `
        accepted_submission_count,
        current_streak_days,
        longest_streak_days,
        weekly_submission_count,
        last_submission_date,
        profiles!inner (
          id,
          display_name,
          current_badge_level,
          is_verified_reporter
        )
      `,
      )
      .gt('weekly_submission_count', 0)
      .order('weekly_submission_count', { ascending: false })
      .order('accepted_submission_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return ((data as Array<ReporterStatsJoinRow>) ?? []).map((row, index) =>
      this.mapLeaderboardItem(row, index + 1),
    );
  }

  async getProfile(reporterId: string): Promise<ReporterProfile> {
    const { data, error } = await this.supabase.db
      .from('reporter_stats')
      .select(
        `
        accepted_submission_count,
        current_streak_days,
        longest_streak_days,
        last_submission_date,
        profiles!inner (
          id,
          display_name,
          current_badge_level,
          is_verified_reporter
        )
      `,
      )
      .eq('reporter_id', reporterId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Reporter not found');
    }

    return this.mapProfile(data as ReporterStatsJoinRow);
  }

  async getMineHistory(userId: string): Promise<ReporterSubmissionItem[]> {
    const { data, error } = await this.supabase.db
      .from('price_submissions')
      .select(
        `
        id,
        product_id,
        market_id,
        price_naira,
        unit,
        status,
        created_at,
        products!inner ( id, name ),
        markets!inner ( id, name )
      `,
      )
      .eq('submitter_id', userId)
      .eq('source', 'reporter')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return ((data as Array<SubmissionJoinRow>) ?? []).map((row) => {
      const product = first(row.products);
      const market = first(row.markets);
      return {
        id: row.id,
        productId: row.product_id,
        productName: product.name,
        marketId: row.market_id,
        marketName: market.name,
        priceNaira: row.price_naira,
        unit: row.unit,
        status: row.status,
        submittedAt: row.created_at,
      };
    });
  }

  private mapLeaderboardItem(
    row: ReporterStatsJoinRow,
    rank: number,
  ): ReporterLeaderboardItem {
    return {
      ...this.mapProfile(row),
      rank,
      weeklySubmissionCount: row.weekly_submission_count ?? 0,
    };
  }

  private mapProfile(row: ReporterStatsJoinRow): ReporterProfile {
    const profile = first(row.profiles);
    return {
      id: profile.id,
      displayName: profile.display_name ?? 'LMI Reporter',
      badgeLevel: profile.current_badge_level,
      isVerifiedReporter: profile.is_verified_reporter,
      acceptedSubmissionCount: row.accepted_submission_count ?? 0,
      currentStreakDays: row.current_streak_days ?? 0,
      longestStreakDays: row.longest_streak_days ?? 0,
      lastSubmissionDate: row.last_submission_date,
    };
  }
}

interface ReporterStatsJoinRow {
  accepted_submission_count: number;
  current_streak_days: number;
  longest_streak_days: number;
  weekly_submission_count?: number;
  last_submission_date: string | null;
  profiles:
    | {
        id: string;
        display_name: string | null;
        current_badge_level: string | null;
        is_verified_reporter: boolean;
      }
    | Array<{
        id: string;
        display_name: string | null;
        current_badge_level: string | null;
        is_verified_reporter: boolean;
      }>;
}

interface SubmissionJoinRow {
  id: string;
  product_id: string;
  market_id: string;
  price_naira: number;
  unit: string;
  status: string;
  created_at: string;
  products: { id: string; name: string } | Array<{ id: string; name: string }>;
  markets: { id: string; name: string } | Array<{ id: string; name: string }>;
}

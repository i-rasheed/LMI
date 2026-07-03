import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminFlagActionInput } from '@lmi/shared';
import { SupabaseService } from '../supabase/supabase.service';
import { FlagQueueQuery } from './admin.dto';
import {
  FlagActionResult,
  FlagQueueItem,
  FlagReviewDetail,
  FlagReviewRow,
  PriceFlagRow,
  PriceSubmissionRow,
  ProfileJoinRow,
  SubmissionJoinRow,
} from './admin.types';

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class AdminFlagsService {
  constructor(private readonly supabase: SupabaseService) {}

  async listFlagQueue(query: FlagQueueQuery): Promise<FlagQueueItem[]> {
    let builder = this.supabase.db
      .from('flag_reviews')
      .select(
        `
        id,
        submission_id,
        flag_count,
        escalated_at,
        price_submissions!inner (
          id,
          product_id,
          market_id,
          submitter_id,
          price_naira,
          unit,
          status,
          products!inner ( id, name ),
          markets!inner ( id, name ),
          profiles!inner (
            id,
            display_name,
            current_badge_level,
            is_verified_reporter
          )
        )
      `,
      )
      .eq('is_resolved', false)
      .order('escalated_at', { ascending: true });

    if (query.min_flag_count != null) {
      builder = builder.gte('flag_count', query.min_flag_count);
    }

    const { data, error } = await builder;

    if (error) {
      throw error;
    }

    let items = ((data as unknown as FlagReviewRow[]) ?? []).map((row) =>
      this.mapQueueItem(row),
    );

    if (query.market_id) {
      items = items.filter((item) => item.marketId === query.market_id);
    }

    if (query.product_id) {
      items = items.filter((item) => item.productId === query.product_id);
    }

    return items;
  }

  async getFlagReview(reviewId: string): Promise<FlagReviewDetail> {
    const { data, error } = await this.supabase.db
      .from('flag_reviews')
      .select(
        `
        id,
        submission_id,
        flag_count,
        escalated_at,
        is_resolved,
        price_submissions!inner (
          id,
          product_id,
          market_id,
          submitter_id,
          price_naira,
          unit,
          photo_url,
          status,
          is_auto_flagged,
          auto_flag_reason,
          created_at,
          products!inner ( id, name ),
          markets!inner ( id, name ),
          profiles!inner (
            id,
            display_name,
            current_badge_level,
            is_verified_reporter
          )
        )
      `,
      )
      .eq('id', reviewId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Flag review not found');
    }

    const row = data as unknown as FlagReviewRow;
    const submission = first(row.price_submissions) as SubmissionJoinRow;
    const profile = first(submission.profiles) as ProfileJoinRow;

    const [{ data: flags, error: flagsError }, { data: stats, error: statsError }, { data: avg, error: avgError }] =
      await Promise.all([
        this.supabase.db
          .from('price_flags')
          .select('id, reason, comment, created_at')
          .eq('submission_id', row.submission_id)
          .order('created_at', { ascending: false }),
        this.supabase.db
          .from('reporter_stats')
          .select('accepted_submission_count')
          .eq('reporter_id', submission.submitter_id)
          .maybeSingle(),
        this.supabase.db.rpc('get_market_7day_avg', {
          p_product_id: submission.product_id,
          p_market_id: submission.market_id,
          p_unit: submission.unit,
        }),
      ]);

    if (flagsError) {
      throw flagsError;
    }
    if (statsError) {
      throw statsError;
    }
    if (avgError) {
      throw avgError;
    }

    const reasonBreakdown: Record<string, number> = {};
    for (const flag of (flags as PriceFlagRow[]) ?? []) {
      reasonBreakdown[flag.reason] = (reasonBreakdown[flag.reason] ?? 0) + 1;
    }

    const product = first(submission.products);
    const market = first(submission.markets);

    return {
      id: row.id,
      submissionId: row.submission_id,
      flagCount: row.flag_count,
      escalatedAt: row.escalated_at,
      isResolved: row.is_resolved,
      submission: {
        id: submission.id,
        productId: submission.product_id,
        productName: product.name,
        marketId: submission.market_id,
        marketName: market.name,
        priceNaira: submission.price_naira,
        unit: submission.unit,
        photoUrl: submission.photo_url,
        status: submission.status,
        submittedAt: submission.created_at,
        isAutoFlagged: submission.is_auto_flagged,
        autoFlagReason: submission.auto_flag_reason,
      },
      reporter: {
        id: profile.id,
        displayName: profile.display_name?.trim() || 'Reporter',
        badgeLevel: profile.current_badge_level,
        isVerifiedReporter: profile.is_verified_reporter,
        acceptedSubmissionCount: stats?.accepted_submission_count ?? 0,
      },
      flags: ((flags as PriceFlagRow[]) ?? []).map((flag) => ({
        id: flag.id,
        reason: flag.reason,
        comment: flag.comment,
        createdAt: flag.created_at,
      })),
      reasonBreakdown,
      marketAverageNaira: avg != null ? Math.round(Number(avg)) : null,
    };
  }

  async applyFlagAction(
    adminId: string,
    reviewId: string,
    action: AdminFlagActionInput,
  ): Promise<FlagActionResult> {
    const review = await this.getReviewContext(reviewId);

    if (review.is_resolved) {
      throw new BadRequestException('Flag review is already resolved');
    }

    switch (action.action) {
      case 'confirm':
        await this.confirmSubmission(adminId, review);
        break;
      case 'edit':
        if (action.priceNaira == null) {
          throw new BadRequestException('priceNaira is required for edit');
        }
        await this.editSubmission(adminId, review, action.priceNaira);
        break;
      case 'remove':
        await this.removeSubmission(adminId, review);
        break;
      case 'warn':
        await this.warnReporter(adminId, review, action.title, action.body);
        break;
      case 'ban':
        await this.banReporter(adminId, review);
        break;
    }

    const { data: updated, error } = await this.supabase.db
      .from('price_submissions')
      .select('status')
      .eq('id', review.submission_id)
      .single();

    if (error) {
      throw error;
    }

    return {
      reviewId,
      submissionId: review.submission_id,
      action: action.action,
      submissionStatus: updated.status as string,
    };
  }

  async getPendingFlagCount(): Promise<number> {
    const { count, error } = await this.supabase.db
      .from('flag_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('is_resolved', false);

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

  private mapQueueItem(row: FlagReviewRow): FlagQueueItem {
    const submission = first(row.price_submissions) as SubmissionJoinRow;
    const product = first(submission.products);
    const market = first(submission.markets);
    const profile = first(submission.profiles) as ProfileJoinRow;

    return {
      id: row.id,
      submissionId: row.submission_id,
      flagCount: row.flag_count,
      escalatedAt: row.escalated_at,
      status: submission.status,
      productId: submission.product_id,
      productName: product.name,
      marketId: submission.market_id,
      marketName: market.name,
      priceNaira: submission.price_naira,
      unit: submission.unit,
      reporter: {
        id: profile.id,
        displayName: profile.display_name?.trim() || 'Reporter',
        badgeLevel: profile.current_badge_level,
        isVerifiedReporter: profile.is_verified_reporter,
      },
    };
  }

  private async getReviewContext(reviewId: string) {
    const { data, error } = await this.supabase.db
      .from('flag_reviews')
      .select('id, submission_id, is_resolved')
      .eq('id', reviewId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Flag review not found');
    }

    return data;
  }

  private async confirmSubmission(
    adminId: string,
    review: { id: string; submission_id: string },
  ): Promise<void> {
    const now = new Date().toISOString();

    await this.supabase.db
      .from('price_submissions')
      .update({
        status: 'live',
        flag_count: 0,
        updated_at: now,
      })
      .eq('id', review.submission_id);

    await this.supabase.db
      .from('current_prices')
      .update({
        status: 'live',
        flag_count: 0,
        updated_at: now,
      })
      .eq('submission_id', review.submission_id);

    await this.resolveFlags(review.submission_id, adminId, 'confirmed');
    await this.resolveReview(review.id);
    await this.logAdminAction(adminId, 'flag_confirm', review.submission_id);
  }

  private async editSubmission(
    adminId: string,
    review: { id: string; submission_id: string },
    priceNaira: number,
  ): Promise<void> {
    const now = new Date().toISOString();

    await this.supabase.db
      .from('price_submissions')
      .update({
        price_naira: priceNaira,
        status: 'live',
        flag_count: 0,
        updated_at: now,
      })
      .eq('id', review.submission_id);

    await this.resolveFlags(review.submission_id, adminId, 'edited');
    await this.resolveReview(review.id);
    await this.logAdminAction(adminId, 'flag_edit', review.submission_id, {
      priceNaira,
    });
  }

  private async removeSubmission(
    adminId: string,
    review: { id: string; submission_id: string },
  ): Promise<void> {
    const now = new Date().toISOString();

    await this.supabase.db
      .from('price_submissions')
      .update({
        status: 'removed',
        updated_at: now,
      })
      .eq('id', review.submission_id);

    await this.supabase.db
      .from('current_prices')
      .update({
        status: 'removed',
        updated_at: now,
      })
      .eq('submission_id', review.submission_id);

    await this.resolveFlags(review.submission_id, adminId, 'removed');
    await this.resolveReview(review.id);
    await this.logAdminAction(adminId, 'flag_remove', review.submission_id);
  }

  private async warnReporter(
    adminId: string,
    review: { id: string; submission_id: string },
    title?: string,
    body?: string,
  ): Promise<void> {
    const { data: submission, error } = await this.supabase.db
      .from('price_submissions')
      .select('submitter_id')
      .eq('id', review.submission_id)
      .single();

    if (error) {
      throw error;
    }

    const row = submission as PriceSubmissionRow;

    await this.supabase.db.from('account_warnings').insert({
      user_id: row.submitter_id,
      issued_by: adminId,
      title: title?.trim() || 'Submission guidelines reminder',
      body:
        body?.trim() ||
        'An admin reviewed your recent price submission. Please follow submission guidelines to keep prices accurate.',
      related_submission_id: review.submission_id,
    });

    await this.confirmSubmission(adminId, review);
    await this.logAdminAction(
      adminId,
      'warn_reporter',
      row.submitter_id,
      { submissionId: review.submission_id },
      'profile',
    );
  }

  private async banReporter(
    adminId: string,
    review: { id: string; submission_id: string },
  ): Promise<void> {
    const { data: submission, error } = await this.supabase.db
      .from('price_submissions')
      .select('submitter_id')
      .eq('id', review.submission_id)
      .single();

    if (error) {
      throw error;
    }

    const row = submission as PriceSubmissionRow;
    const now = new Date().toISOString();

    await this.supabase.db
      .from('profiles')
      .update({
        account_status: 'suspended',
        updated_at: now,
      })
      .eq('id', row.submitter_id);

    await this.removeSubmission(adminId, review);
    await this.logAdminAction(
      adminId,
      'ban_reporter',
      row.submitter_id,
      { submissionId: review.submission_id },
      'profile',
    );
  }

  private async resolveFlags(
    submissionId: string,
    adminId: string,
    resolution: 'confirmed' | 'edited' | 'removed',
  ): Promise<void> {
    const now = new Date().toISOString();

    await this.supabase.db
      .from('price_flags')
      .update({
        resolution,
        resolved_by: adminId,
        resolved_at: now,
      })
      .eq('submission_id', submissionId)
      .eq('resolution', 'pending');
  }

  private async resolveReview(reviewId: string): Promise<void> {
    const now = new Date().toISOString();

    await this.supabase.db
      .from('flag_reviews')
      .update({
        is_resolved: true,
        resolved_at: now,
      })
      .eq('id', reviewId);
  }

  private async logAdminAction(
    adminId: string,
    actionType: string,
    targetId: string,
    metadata: Record<string, unknown> = {},
    targetType = 'price_submission',
  ): Promise<void> {
    const { error } = await this.supabase.db.from('admin_actions').insert({
      admin_id: adminId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      metadata,
    });

    if (error) {
      throw error;
    }
  }
}

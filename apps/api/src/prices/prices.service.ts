import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  DUPLICATE_SUBMISSION_MINUTES,
  OUTLIER_DEVIATION_PERCENT,
} from '@lmi/shared';
import { SupabaseService } from '../supabase/supabase.service';
import { ProductsService } from '../products/products.service';
import {
  ComparePriceItem,
  CompareQuery,
  CompareResponse,
  CurrentPriceRow,
  FlagSubmissionResult,
  MarketAverageResponse,
  PriceHistoryResponse,
  PriceSubmissionRow,
  ReporterStatsSnapshot,
  SubmissionResponse,
  SubmitPriceInput,
} from './prices.types';

const VISIBLE_STATUSES = ['live', 'flagged', 'under_review'];

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapRow(row: CurrentPriceRow, distanceKm?: number): ComparePriceItem {
  const market = Array.isArray(row.markets) ? row.markets[0] : row.markets;
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const stall = Array.isArray(row.vendor_stalls)
    ? row.vendor_stalls[0]
    : row.vendor_stalls;

  const stallName = stall?.stall_name?.trim() || null;
  const profileName = profile.display_name?.trim() || null;
  const displayName =
    row.source === 'vendor'
      ? stallName || profileName || 'Vendor'
      : profileName || 'Community';

  return {
    id: row.id,
    submissionId: row.submission_id,
    marketId: market.id,
    marketName: market.name,
    marketArea: market.area,
    marketSlug: market.slug,
    latitude: Number(market.latitude),
    longitude: Number(market.longitude),
    priceNaira: row.price_naira,
    unit: row.unit,
    submittedAt: row.submitted_at,
    distanceKm:
      distanceKm != null ? Number(distanceKm.toFixed(2)) : undefined,
    source: row.source,
    status: row.status,
    vendorStallId: row.vendor_stall_id,
    vendorStallName: stallName,
    submitter: {
      id: profile.id,
      displayName,
      badgeLevel: profile.current_badge_level,
      isVerifiedReporter: profile.is_verified_reporter,
    },
  };
}

@Injectable()
export class PricesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly productsService: ProductsService,
  ) {}

  async compareProduct(
    productId: string,
    query: CompareQuery,
  ): Promise<CompareResponse> {
    const product = await this.productsService.getProductById(productId);

    const { data, error } = await this.supabase.db
      .from('current_prices')
      .select(
        `
        id,
        product_id,
        market_id,
        unit,
        price_naira,
        submission_id,
        submitter_id,
        source,
        vendor_stall_id,
        status,
        submitted_at,
        markets!inner (
          id,
          name,
          slug,
          area,
          latitude,
          longitude
        ),
        profiles!inner (
          id,
          display_name,
          current_badge_level,
          is_verified_reporter
        ),
        vendor_stalls (
          id,
          stall_name
        )
      `,
      )
      .eq('product_id', productId)
      .in('status', VISIBLE_STATUSES);

    if (error) {
      throw error;
    }

    let items = ((data as unknown as CurrentPriceRow[]) ?? []).map((row) => {
      const market = Array.isArray(row.markets) ? row.markets[0] : row.markets;
      const distanceKm =
        query.lat != null && query.lng != null
          ? haversineKm(
              query.lat,
              query.lng,
              Number(market.latitude),
              Number(market.longitude),
            )
          : undefined;
      return mapRow(row, distanceKm);
    });

    if (query.area) {
      const areaLower = query.area.toLowerCase();
      items = items.filter((item) =>
        item.marketArea.toLowerCase().includes(areaLower),
      );
    }

    if (query.updatedWithinHours != null) {
      const cutoff = Date.now() - query.updatedWithinHours * 60 * 60 * 1000;
      items = items.filter(
        (item) => new Date(item.submittedAt).getTime() >= cutoff,
      );
    }

    if (query.maxDistanceKm != null && query.lat != null && query.lng != null) {
      items = items.filter(
        (item) =>
          item.distanceKm != null && item.distanceKm <= query.maxDistanceKm!,
      );
    }

    items = this.sortPrices(items, query.sort ?? 'cheapest');

    const cheapest = items.length
      ? [...items].sort((a, b) => a.priceNaira - b.priceNaira)[0]
      : null;

    return {
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        defaultUnit: product.defaultUnit,
        photoUrl: product.photoUrl,
      },
      prices: items,
      cheapest: cheapest
        ? {
            priceNaira: cheapest.priceNaira,
            marketName: cheapest.marketName,
            unit: cheapest.unit,
          }
        : null,
    };
  }

  private sortPrices(
    items: ComparePriceItem[],
    sort: CompareQuery['sort'],
  ): ComparePriceItem[] {
    const sorted = [...items];

    switch (sort) {
      case 'freshest':
        sorted.sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        );
        break;
      case 'nearest':
        sorted.sort((a, b) => {
          if (a.distanceKm == null && b.distanceKm == null) {
            return a.priceNaira - b.priceNaira;
          }
          if (a.distanceKm == null) return 1;
          if (b.distanceKm == null) return -1;
          return a.distanceKm - b.distanceKm;
        });
        break;
      case 'cheapest':
      default:
        sorted.sort((a, b) => a.priceNaira - b.priceNaira);
        break;
    }

    return sorted;
  }

  async getMarketAverage(
    productId: string,
    marketId: string,
    unit: string,
  ): Promise<MarketAverageResponse> {
    const { data: avg, error: avgError } = await this.supabase.db.rpc(
      'get_market_7day_avg',
      {
        p_product_id: productId,
        p_market_id: marketId,
        p_unit: unit,
      },
    );

    if (avgError) {
      throw avgError;
    }

    const { count, error: countError } = await this.supabase.db
      .from('price_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('market_id', marketId)
      .eq('unit', unit)
      .in('status', ['live', 'flagged', 'under_review', 'removed'])
      .gte(
        'created_at',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (countError) {
      throw countError;
    }

    return {
      productId,
      marketId,
      unit,
      averageNaira: avg != null ? Math.round(Number(avg)) : null,
      sampleCount: count ?? 0,
    };
  }

  async getPriceHistory(
    userId: string,
    productId: string,
  ): Promise<PriceHistoryResponse> {
    await this.productsService.getProductById(productId);
    await this.assertPremium(userId);

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await this.supabase.db
      .from('price_submissions')
      .select('price_naira, created_at')
      .eq('product_id', productId)
      .in('status', VISIBLE_STATUSES)
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const buckets = new Map<string, { total: number; count: number }>();
    for (const row of (data as Array<{ price_naira: number; created_at: string }>) ??
      []) {
      const date = row.created_at.slice(0, 10);
      const bucket = buckets.get(date) ?? { total: 0, count: 0 };
      bucket.total += row.price_naira;
      bucket.count += 1;
      buckets.set(date, bucket);
    }

    return {
      productId,
      points: [...buckets.entries()].map(([date, bucket]) => ({
        date,
        averagePriceNaira: Math.round(bucket.total / bucket.count),
        sampleCount: bucket.count,
      })),
    };
  }

  async submitPrice(
    userId: string,
    input: SubmitPriceInput,
  ): Promise<SubmissionResponse> {
    await this.productsService.getProductById(input.productId);
    await this.assertMarketExists(input.marketId);

    if (!input.replacesSubmissionId) {
      await this.assertNotDuplicate(userId, input);
    } else {
      await this.assertOwnedSubmission(userId, input.replacesSubmissionId);
    }

    if (!input.confirmOutlier) {
      await this.assertOutlierAllowed(input);
    }

    const photoUrl = input.photoUrl?.trim() ? input.photoUrl.trim() : null;

    const { data, error } = await this.supabase.db
      .from('price_submissions')
      .insert({
        product_id: input.productId,
        market_id: input.marketId,
        submitter_id: userId,
        source: 'reporter',
        price_naira: input.priceNaira,
        unit: input.unit,
        photo_url: photoUrl,
        replaces_submission_id: input.replacesSubmissionId ?? null,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return this.buildSubmissionResponse(data as PriceSubmissionRow, userId);
  }

  async flagSubmission(
    flaggerId: string,
    submissionId: string,
    input: { reason: string; comment?: string },
  ): Promise<FlagSubmissionResult> {
    const { data: submission, error } = await this.supabase.db
      .from('price_submissions')
      .select('submitter_id, status')
      .eq('id', submissionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.submitter_id === flaggerId) {
      throw new ForbiddenException('You cannot flag your own submission');
    }

    if (submission.status === 'removed') {
      throw new BadRequestException('Submission is no longer available');
    }

    const comment = input.comment?.trim() ? input.comment.trim() : null;

    const { data: flag, error: insertError } = await this.supabase.db
      .from('price_flags')
      .insert({
        submission_id: submissionId,
        flagger_id: flaggerId,
        reason: input.reason,
        comment,
      })
      .select('id')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        throw new ConflictException('You already reported this price');
      }
      throw insertError;
    }

    const { data: updated, error: updatedError } = await this.supabase.db
      .from('price_submissions')
      .select('flag_count, status')
      .eq('id', submissionId)
      .single();

    if (updatedError) {
      throw updatedError;
    }

    return {
      flagId: flag.id as string,
      flagCount: updated.flag_count as number,
      escalated: updated.status === 'under_review',
    };
  }

  async updatePrice(
    userId: string,
    submissionId: string,
    input: Omit<SubmitPriceInput, 'replacesSubmissionId'>,
  ): Promise<SubmissionResponse> {
    const existing = await this.assertOwnedSubmission(userId, submissionId);

    return this.submitPrice(userId, {
      ...input,
      marketId: existing.market_id,
      productId: existing.product_id,
      replacesSubmissionId: submissionId,
    });
  }

  private async assertMarketExists(marketId: string): Promise<void> {
    const { data, error } = await this.supabase.db
      .from('markets')
      .select('id')
      .eq('id', marketId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Market not found');
    }
  }

  private async assertPremium(userId: string): Promise<void> {
    const { data, error } = await this.supabase.db.rpc('has_active_premium', {
      p_user_id: userId,
    });

    if (error) {
      throw error;
    }

    if (!data) {
      throw new HttpException(
        {
          code: 'PREMIUM_REQUIRED',
          message: 'Premium is required for price history.',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  private async assertOwnedSubmission(
    userId: string,
    submissionId: string,
  ): Promise<PriceSubmissionRow> {
    const { data, error } = await this.supabase.db
      .from('price_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Submission not found');
    }

    const row = data as PriceSubmissionRow;

    if (row.submitter_id !== userId) {
      throw new ForbiddenException('You can only update your own submissions');
    }

    return row;
  }

  private async assertNotDuplicate(
    userId: string,
    input: SubmitPriceInput,
  ): Promise<void> {
    const { data: isDuplicate, error } = await this.supabase.db.rpc(
      'check_duplicate_submission',
      {
        p_submitter_id: userId,
        p_product_id: input.productId,
        p_market_id: input.marketId,
        p_unit: input.unit,
      },
    );

    if (error) {
      throw error;
    }

    if (!isDuplicate) {
      return;
    }

    const { data: lastSubmission, error: lastError } = await this.supabase.db
      .from('price_submissions')
      .select('created_at')
      .eq('submitter_id', userId)
      .eq('product_id', input.productId)
      .eq('market_id', input.marketId)
      .eq('unit', input.unit)
      .gte(
        'created_at',
        new Date(
          Date.now() - DUPLICATE_SUBMISSION_MINUTES * 60 * 1000,
        ).toISOString(),
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastError) {
      throw lastError;
    }

    let retryAfterMinutes = DUPLICATE_SUBMISSION_MINUTES;
    if (lastSubmission?.created_at) {
      const unlockAt =
        new Date(lastSubmission.created_at).getTime() +
        DUPLICATE_SUBMISSION_MINUTES * 60 * 1000;
      retryAfterMinutes = Math.max(
        1,
        Math.ceil((unlockAt - Date.now()) / 60_000),
      );
    }

    throw new ConflictException({
      code: 'DUPLICATE_SUBMISSION',
      message:
        'You already submitted this price recently. Try again in a few minutes.',
      retryAfterMinutes,
    });
  }

  private async assertOutlierAllowed(input: SubmitPriceInput): Promise<void> {
    const { data: avg, error } = await this.supabase.db.rpc(
      'get_market_7day_avg',
      {
        p_product_id: input.productId,
        p_market_id: input.marketId,
        p_unit: input.unit,
      },
    );

    if (error) {
      throw error;
    }

    if (avg == null || Number(avg) <= 0) {
      return;
    }

    const average = Number(avg);
    const deviation = Math.abs(input.priceNaira - average) / average;
    const threshold = OUTLIER_DEVIATION_PERCENT / 100;

    if (deviation <= threshold) {
      return;
    }

    throw new UnprocessableEntityException({
      code: 'OUTLIER_WARNING',
      message: 'This price looks unusual. Are you sure?',
      marketAverage: Math.round(average),
      submittedPrice: input.priceNaira,
      deviationPercent: Math.round(deviation * 100),
    });
  }

  private async buildSubmissionResponse(
    row: PriceSubmissionRow,
    userId: string,
  ): Promise<SubmissionResponse> {
    const reporterStats = await this.fetchReporterStatsSnapshot(userId);

    return {
      submissionId: row.id,
      status: row.status,
      isAutoFlagged: row.is_auto_flagged,
      productId: row.product_id,
      marketId: row.market_id,
      priceNaira: row.price_naira,
      unit: row.unit,
      photoUrl: row.photo_url,
      submittedAt: row.created_at,
      reporterStats,
    };
  }

  private async fetchReporterStatsSnapshot(
    userId: string,
  ): Promise<ReporterStatsSnapshot> {
    const [{ data: stats, error: statsError }, { data: profile, error: profileError }] =
      await Promise.all([
        this.supabase.db
          .from('reporter_stats')
          .select(
            'accepted_submission_count, current_streak_days',
          )
          .eq('reporter_id', userId)
          .maybeSingle(),
        this.supabase.db
          .from('profiles')
          .select('current_badge_level')
          .eq('id', userId)
          .maybeSingle(),
      ]);

    if (statsError) {
      throw statsError;
    }
    if (profileError) {
      throw profileError;
    }

    const count = stats?.accepted_submission_count ?? 0;
    const currentBadgeLevel =
      (profile?.current_badge_level as string | null) ?? null;
    const badgeProgress = this.computeBadgeProgress(count, currentBadgeLevel);

    return {
      acceptedSubmissionCount: count,
      currentBadgeLevel: badgeProgress.currentBadgeLevel,
      nextBadgeLevel: badgeProgress.nextBadgeLevel,
      submissionsUntilNextBadge: badgeProgress.submissionsUntilNextBadge,
      currentStreakDays: stats?.current_streak_days ?? 0,
    };
  }

  private computeBadgeProgress(
    count: number,
    currentBadgeLevel: string | null,
  ): Pick<
    ReporterStatsSnapshot,
    'currentBadgeLevel' | 'nextBadgeLevel' | 'submissionsUntilNextBadge'
  > {
    if (count >= 500) {
      return {
        currentBadgeLevel: currentBadgeLevel ?? 'elite',
        nextBadgeLevel: null,
        submissionsUntilNextBadge: null,
      };
    }
    if (count >= 200) {
      return {
        currentBadgeLevel: currentBadgeLevel ?? 'gold',
        nextBadgeLevel: 'elite',
        submissionsUntilNextBadge: 500 - count,
      };
    }
    if (count >= 50) {
      return {
        currentBadgeLevel: currentBadgeLevel ?? 'silver',
        nextBadgeLevel: 'gold',
        submissionsUntilNextBadge: 200 - count,
      };
    }
    if (count >= 1) {
      return {
        currentBadgeLevel: currentBadgeLevel ?? 'bronze',
        nextBadgeLevel: 'silver',
        submissionsUntilNextBadge: 50 - count,
      };
    }

    return {
      currentBadgeLevel: currentBadgeLevel,
      nextBadgeLevel: 'bronze',
      submissionsUntilNextBadge: 1,
    };
  }
}

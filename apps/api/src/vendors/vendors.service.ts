import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AuthUser } from '../users/users.types';
import { SupabaseService } from '../supabase/supabase.service';
import {
  StallClaimInput,
  UpdateVendorProductInput,
  VendorAnalyticsEventInput,
  VendorProductInput,
} from './vendors.dto';
import {
  ClaimStatusResponse,
  mapClaimStatus,
  mapVendorProductItem,
  MarketJoinRow,
  VendorAnalyticsSummary,
  VendorDashboardResponse,
  VendorProductItem,
  VendorProductResult,
  VendorProductRow,
  VendorStallRow,
} from './vendors.types';

@Injectable()
export class VendorsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly productsService: ProductsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async submitClaim(
    userId: string,
    input: StallClaimInput,
  ): Promise<ClaimStatusResponse> {
    await this.assertMarketExists(input.marketId);
    const existing = await this.getOwnedStallRow(userId);

    if (existing) {
      if (existing.claim_status === 'approved' || existing.claim_status === 'pending') {
        throw new ConflictException('You already have a stall');
      }
      throw new ConflictException(
        'Rejected claims must be updated via PATCH /vendors/claim',
      );
    }

    const { data, error } = await this.supabase.db
      .from('vendor_stalls')
      .insert({
        owner_id: userId,
        market_id: input.marketId,
        stall_name: input.stallName,
        description: input.description,
        location_hint: input.locationHint,
        categories: input.categories,
        photos: input.photos ?? [],
        claim_status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const market = await this.fetchMarket(input.marketId);
    return mapClaimStatus(data as VendorStallRow, market);
  }

  async getClaimStatus(userId: string): Promise<ClaimStatusResponse> {
    const stall = await this.ensureClaimApproved(
      await this.getOwnedStallRow(userId),
    );

    if (!stall) {
      return {
        hasClaim: false,
        id: null,
        stallName: null,
        marketId: null,
        marketName: null,
        marketArea: null,
        description: null,
        locationHint: null,
        categories: [],
        photos: [],
        claimStatus: null,
        rejectionReason: null,
        vendorTier: null,
        isVerified: false,
        reviewedAt: null,
        canPublishProducts: false,
      };
    }

    const market = await this.fetchMarket(stall.market_id);
    return mapClaimStatus(stall, market);
  }

  async resubmitClaim(
    userId: string,
    input: StallClaimInput,
  ): Promise<ClaimStatusResponse> {
    await this.assertMarketExists(input.marketId);
    const stall = await this.ensureClaimApproved(
      await this.getOwnedStallRow(userId),
    );

    if (!stall) {
      throw new NotFoundException('No stall claim found');
    }

    if (stall.claim_status !== 'rejected') {
      throw new BadRequestException('Only rejected claims can be resubmitted');
    }

    const { data, error } = await this.supabase.db
      .from('vendor_stalls')
      .update({
        market_id: input.marketId,
        stall_name: input.stallName,
        description: input.description,
        location_hint: input.locationHint,
        categories: input.categories,
        photos: input.photos ?? [],
        claim_status: 'approved',
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', stall.id)
      .eq('owner_id', userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const market = await this.fetchMarket(input.marketId);
    return mapClaimStatus(data as VendorStallRow, market);
  }

  async getDashboard(userId: string): Promise<VendorDashboardResponse> {
    const stall = await this.ensureClaimApproved(
      await this.getOwnedStallRow(userId),
    );

    if (!stall) {
      return {
        stall: null,
        stats: {
          profileViews7d: 0,
          productCount: 0,
          productClicks7d: null,
        },
        canPublishProducts: false,
      };
    }

    const market = await this.fetchMarket(stall.market_id);
    const productCount = await this.countVendorProducts(stall.id);
    const profileViews7d = await this.countProfileViews7d(stall.id);
    const productClicks7d =
      stall.vendor_tier === 'pro'
        ? await this.countProductClicks7d(stall.id)
        : null;

    return {
      stall: {
        id: stall.id,
        stallName: stall.stall_name,
        marketName: market?.name ?? '',
        marketArea: market?.area ?? '',
        claimStatus: stall.claim_status,
        isVerified: stall.is_verified,
        vendorTier: stall.vendor_tier,
        description: stall.description,
        locationHint: stall.location_hint,
        categories: stall.categories ?? [],
        photos: stall.photos ?? [],
      },
      stats: {
        profileViews7d,
        productCount,
        productClicks7d,
      },
      canPublishProducts: stall.claim_status !== 'rejected',
    };
  }

  async listProducts(userId: string): Promise<VendorProductItem[]> {
    const stall = await this.requireApprovedStall(userId);

    const { data, error } = await this.supabase.db
      .from('price_submissions')
      .select(
        `
        id,
        product_id,
        market_id,
        price_naira,
        unit,
        photo_url,
        status,
        created_at,
        updated_at,
        products!inner (
          id,
          name,
          slug,
          category,
          default_unit,
          photo_url
        )
      `,
      )
      .eq('vendor_stall_id', stall.id)
      .eq('source', 'vendor')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as VendorProductRow[]) ?? []).map(mapVendorProductItem);
  }

  async addProduct(
    userId: string,
    input: VendorProductInput,
  ): Promise<VendorProductResult> {
    const stall = await this.requireApprovedStall(userId);
    const productId = input.productId
      ? input.productId
      : (
          await this.productsService.findOrCreateByName(
            input.productName!,
            input.category ?? 'other',
            input.unit,
          )
        ).id;

    await this.productsService.getProductById(productId);

    const status = input.isAvailableToday ? 'live' : 'removed';
    const photoUrl = input.photoUrl?.trim() ? input.photoUrl.trim() : null;

    const { data, error } = await this.supabase.db
      .from('price_submissions')
      .insert({
        product_id: productId,
        market_id: stall.market_id,
        submitter_id: userId,
        source: 'vendor',
        vendor_stall_id: stall.id,
        price_naira: input.priceNaira,
        unit: input.unit,
        photo_url: photoUrl,
        status,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'You already have a listing for this product and unit at your market',
        );
      }
      throw error;
    }

    return this.mapProductResult(data as VendorStallRow & {
      id: string;
      product_id: string;
      price_naira: number;
      unit: string;
      photo_url: string | null;
      status: string;
      updated_at: string;
    });
  }

  async updateProduct(
    userId: string,
    submissionId: string,
    input: UpdateVendorProductInput,
  ): Promise<VendorProductResult> {
    const stall = await this.requireApprovedStall(userId);
    const existing = await this.getOwnedProductSubmission(
      userId,
      stall.id,
      submissionId,
    );

    const nextStatus =
      input.isAvailableToday != null
        ? input.isAvailableToday
          ? 'live'
          : 'removed'
        : existing.status;

    const { data, error } = await this.supabase.db
      .from('price_submissions')
      .update({
        price_naira: input.priceNaira ?? existing.price_naira,
        unit: input.unit ?? existing.unit,
        photo_url:
          input.photoUrl !== undefined
            ? input.photoUrl?.trim()
              ? input.photoUrl.trim()
              : null
            : existing.photo_url,
        status: nextStatus,
      })
      .eq('id', submissionId)
      .eq('vendor_stall_id', stall.id)
      .eq('submitter_id', userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return this.mapProductResult(data as {
      id: string;
      product_id: string;
      price_naira: number;
      unit: string;
      photo_url: string | null;
      status: string;
      updated_at: string;
    });
  }

  async getPendingClaimCount(): Promise<number> {
    const { count, error } = await this.supabase.db
      .from('vendor_stalls')
      .select('id', { count: 'exact', head: true })
      .eq('claim_status', 'pending');

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

  async listSubscriptionPlans() {
    return this.subscriptionsService.listVendorPlans();
  }

  async initializeSubscription(user: AuthUser, planId: string, callbackUrl?: string) {
    const stall = await this.requireApprovedStall(user.id);
    return this.subscriptionsService.initializeVendor(user, {
      planId,
      callbackUrl,
      vendorStallId: stall.id,
    });
  }

  async getAnalytics(userId: string): Promise<VendorAnalyticsSummary> {
    const stall = await this.requireApprovedStall(userId);

    if (stall.vendor_tier !== 'pro') {
      throw new ForbiddenException('Vendor Pro is required for analytics');
    }

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await this.supabase.db
      .from('vendor_analytics_events')
      .select('event_type, created_at')
      .eq('vendor_stall_id', stall.id)
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const buckets = new Map<
      string,
      { date: string; profileViews: number; productClicks: number }
    >();
    let profileViews7d = 0;
    let productClicks7d = 0;

    for (const row of (data as Array<{ event_type: string; created_at: string }>) ?? []) {
      const date = row.created_at.slice(0, 10);
      const bucket =
        buckets.get(date) ?? { date, profileViews: 0, productClicks: 0 };

      if (row.event_type === 'profile_view') {
        bucket.profileViews += 1;
        profileViews7d += 1;
      }
      if (row.event_type === 'product_click') {
        bucket.productClicks += 1;
        productClicks7d += 1;
      }

      buckets.set(date, bucket);
    }

    return {
      profileViews7d,
      productClicks7d,
      daily: [...buckets.values()],
    };
  }

  async recordAnalyticsEvent(
    viewerId: string,
    input: VendorAnalyticsEventInput,
  ): Promise<{ recorded: true }> {
    const { data: stall, error: stallError } = await this.supabase.db
      .from('vendor_stalls')
      .select('id, claim_status')
      .eq('id', input.vendorStallId)
      .maybeSingle();

    if (stallError) {
      throw stallError;
    }

    if (!stall || stall.claim_status !== 'approved') {
      throw new NotFoundException('Vendor stall not found');
    }

    if (input.eventType === 'product_click' && !input.productId) {
      throw new BadRequestException('productId is required for product clicks');
    }

    const { error } = await this.supabase.db
      .from('vendor_analytics_events')
      .insert({
        vendor_stall_id: input.vendorStallId,
        event_type: input.eventType,
        product_id: input.productId ?? null,
        viewer_id: viewerId,
      });

    if (error) {
      throw error;
    }

    if (input.eventType === 'profile_view') {
      await this.supabase.db
        .from('vendor_stalls')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', input.vendorStallId);
    }

    return { recorded: true };
  }

  private mapProductResult(row: {
    id: string;
    product_id: string;
    price_naira: number;
    unit: string;
    photo_url: string | null;
    status: string;
    updated_at: string;
  }): VendorProductResult {
    return {
      id: row.id,
      productId: row.product_id,
      priceNaira: row.price_naira,
      unit: row.unit,
      photoUrl: row.photo_url,
      status: row.status,
      isAvailableToday: row.status === 'live',
      updatedAt: row.updated_at,
    };
  }

  private async requireApprovedStall(userId: string): Promise<VendorStallRow> {
    const stall = await this.ensureClaimApproved(
      await this.getOwnedStallRow(userId),
    );

    if (!stall) {
      throw new NotFoundException('Submit a stall claim before managing products');
    }

    if (stall.claim_status === 'rejected') {
      throw new ForbiddenException('Your stall claim was rejected');
    }

    return stall;
  }

  private async ensureClaimApproved(
    stall: VendorStallRow | null,
  ): Promise<VendorStallRow | null> {
    if (!stall || stall.claim_status !== 'pending') {
      return stall;
    }

    const { data, error } = await this.supabase.db
      .from('vendor_stalls')
      .update({
        claim_status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', stall.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as VendorStallRow;
  }

  private async getOwnedStallRow(userId: string): Promise<VendorStallRow | null> {
    const { data, error } = await this.supabase.db
      .from('vendor_stalls')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as VendorStallRow | null) ?? null;
  }

  private async getOwnedProductSubmission(
    userId: string,
    stallId: string,
    submissionId: string,
  ): Promise<VendorProductRow> {
    const { data, error } = await this.supabase.db
      .from('price_submissions')
      .select('*')
      .eq('id', submissionId)
      .eq('vendor_stall_id', stallId)
      .eq('submitter_id', userId)
      .eq('source', 'vendor')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Product listing not found');
    }

    return data as VendorProductRow;
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

  private async fetchMarket(marketId: string): Promise<MarketJoinRow | null> {
    const { data, error } = await this.supabase.db
      .from('markets')
      .select('id, name, slug, area')
      .eq('id', marketId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as MarketJoinRow | null) ?? null;
  }

  private async countVendorProducts(stallId: string): Promise<number> {
    const { count, error } = await this.supabase.db
      .from('price_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_stall_id', stallId)
      .eq('source', 'vendor')
      .neq('status', 'removed');

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

  private async countProductClicks7d(stallId: string): Promise<number> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await this.supabase.db
      .from('vendor_analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_stall_id', stallId)
      .eq('event_type', 'product_click')
      .gte('created_at', since);

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

  private async countProfileViews7d(stallId: string): Promise<number> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await this.supabase.db
      .from('vendor_analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_stall_id', stallId)
      .eq('event_type', 'profile_view')
      .gte('created_at', since);

    if (error) {
      throw error;
    }

    return count ?? 0;
  }
}

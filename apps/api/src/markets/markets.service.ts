import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  MarketDetailResponse,
  MarketListItem,
  MarketRow,
  NearbyMarketsQuery,
  PopularPriceItem,
  VendorStallItem,
} from './markets.types';

function toMarketListItem(
  row: MarketRow & { distance_km?: number | string | null },
): MarketListItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    area: row.area,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    photoUrl: row.photo_url,
    categories: row.categories,
    distanceKm:
      row.distance_km != null
        ? Number(Number(row.distance_km).toFixed(2))
        : undefined,
  };
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class MarketsService {
  constructor(private readonly supabase: SupabaseService) {}

  async listMarkets(query: {
    area?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    limit?: number;
  }): Promise<MarketListItem[]> {
    if (query.lat != null && query.lng != null) {
      return this.getNearbyMarkets({
        lat: query.lat,
        lng: query.lng,
        radiusKm: query.radiusKm,
        limit: query.limit,
      });
    }

    let builder = this.supabase.db
      .from('markets')
      .select(
        'id, name, slug, area, latitude, longitude, photo_url, categories',
      )
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (query.area) {
      builder = builder.ilike('area', `%${query.area}%`);
    }

    if (query.limit) {
      builder = builder.limit(query.limit);
    }

    const { data, error } = await builder;

    if (error) {
      throw error;
    }

    return ((data as MarketRow[]) ?? []).map(toMarketListItem);
  }

  async getNearbyMarkets(query: NearbyMarketsQuery): Promise<MarketListItem[]> {
    const { data, error } = await this.supabase.db.rpc('get_nearby_markets', {
      p_lat: query.lat,
      p_lng: query.lng,
      p_radius_km: query.radiusKm ?? 50,
      p_limit: query.limit ?? 20,
    });

    if (!error) {
      return ((data as MarketRow[]) ?? []).map(toMarketListItem);
    }

    if (error.code === 'PGRST202') {
      const { data: markets, error: listError } = await this.supabase.db
        .from('markets')
        .select(
          'id, name, slug, area, latitude, longitude, photo_url, categories',
        )
        .eq('is_active', true);

      if (listError) {
        throw listError;
      }

      const radiusKm = query.radiusKm ?? 50;
      const limit = query.limit ?? 20;

      return ((markets as MarketRow[]) ?? [])
        .map((row) => {
          const distanceKm = haversineKm(
            query.lat,
            query.lng,
            Number(row.latitude),
            Number(row.longitude),
          );

          return {
            ...toMarketListItem(row),
            distanceKm: Number(distanceKm.toFixed(2)),
          };
        })
        .filter((market) => (market.distanceKm ?? 0) <= radiusKm)
        .sort((left, right) => (left.distanceKm ?? 0) - (right.distanceKm ?? 0))
        .slice(0, limit);
    }

    throw error;
  }

  async getMarketById(id: string): Promise<MarketDetailResponse> {
    const { data, error } = await this.supabase.db
      .from('markets')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Market not found');
    }

    const row = data as MarketRow;
    const [popularPrices, vendorStalls] = await Promise.all([
      this.getPopularPrices(id),
      this.getVendorStalls(id),
    ]);

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      area: row.area,
      description: row.description,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      openingHours: row.opening_hours,
      photoUrl: row.photo_url,
      categories: row.categories,
      popularPrices,
      vendorStalls,
    };
  }

  private async getVendorStalls(marketId: string): Promise<VendorStallItem[]> {
    const { data, error } = await this.supabase.db
      .from('vendor_stalls')
      .select('id, stall_name, description, is_verified, vendor_tier, claim_status')
      .eq('market_id', marketId)
      .eq('claim_status', 'approved')
      .order('vendor_tier', { ascending: false, nullsFirst: false })
      .order('stall_name', { ascending: true })
      .limit(20);

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: (row as { id: string }).id,
      stallName: (row as { stall_name: string }).stall_name,
      description: (row as { description: string }).description,
      isVerified: (row as { is_verified: boolean }).is_verified,
      vendorTier: (row as { vendor_tier: string | null }).vendor_tier,
      isPromoted: (row as { vendor_tier: string | null }).vendor_tier === 'pro',
    }));
  }

  private async getPopularPrices(marketId: string): Promise<PopularPriceItem[]> {
    const { data, error } = await this.supabase.db
      .from('current_prices')
      .select(
        `
        price_naira,
        unit,
        submitted_at,
        source,
        product:products!inner (
          id,
          name,
          slug,
          category
        ),
        profiles!inner (
          display_name,
          current_badge_level
        ),
        vendor_stalls (
          stall_name
        )
      `,
      )
      .eq('market_id', marketId)
      .eq('status', 'live')
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => {
      const rawProduct = row.product as
        | {
            id: string;
            name: string;
            slug: string;
            category: string;
          }
        | Array<{
            id: string;
            name: string;
            slug: string;
            category: string;
          }>;
      const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
      const rawProfile = row.profiles as
        | { display_name: string | null; current_badge_level: string | null }
        | Array<{ display_name: string | null; current_badge_level: string | null }>;
      const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
      const rawStall = row.vendor_stalls as
        | { stall_name: string | null }
        | Array<{ stall_name: string | null }>
        | null;
      const stall = Array.isArray(rawStall) ? rawStall[0] : rawStall;
      const stallName = stall?.stall_name?.trim() || null;
      const profileName = profile.display_name?.trim() || null;
      const source = row.source as string;

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        category: product.category,
        priceNaira: row.price_naira as number,
        unit: row.unit as string,
        submittedAt: row.submitted_at as string,
        submitterName:
          source === 'vendor'
            ? stallName || profileName || 'Vendor'
            : profileName || 'Community',
        badgeLevel: profile.current_badge_level,
      };
    });
  }
}

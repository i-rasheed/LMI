import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ProductCategorySummary,
  ProductDetailResponse,
  ProductRow,
  ProductSearchResult,
  ProductSearchRow,
  TrendingProduct,
  TrendingProductRow,
} from './products.types';

function toSearchResult(row: ProductSearchRow): ProductSearchResult {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    defaultUnit: row.default_unit,
    allowedUnits: row.allowed_units,
    photoUrl: row.photo_url,
    matchScore: Number(Number(row.rank).toFixed(4)),
  };
}

function toTrendingProduct(row: TrendingProductRow): TrendingProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    defaultUnit: row.default_unit,
    photoUrl: row.photo_url,
    searchCount: Number(row.search_count),
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly supabase: SupabaseService) {}

  async searchProducts(
    query: string,
    limit = 10,
  ): Promise<ProductSearchResult[]> {
    const { data, error } = await this.supabase.db.rpc('search_products', {
      p_query: query,
      p_limit: limit,
    });

    if (error) {
      throw error;
    }

    return ((data as ProductSearchRow[]) ?? []).map(toSearchResult);
  }

  async getProductById(id: string): Promise<ProductDetailResponse> {
    const { data, error } = await this.supabase.db
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Product not found');
    }

    const row = data as ProductRow;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category,
      defaultUnit: row.default_unit,
      allowedUnits: row.allowed_units,
      photoUrl: row.photo_url,
      matchScore: 1,
      isActive: row.is_active,
    };
  }

  async getTrendingProducts(limit = 10): Promise<TrendingProduct[]> {
    const { data, error } = await this.supabase.db.rpc('get_trending_products', {
      p_limit: limit,
    });

    if (error) {
      throw error;
    }

    return ((data as TrendingProductRow[]) ?? []).map(toTrendingProduct);
  }

  async listProducts(
    category?: string,
    limit = 50,
  ): Promise<ProductSearchResult[]> {
    let builder = this.supabase.db
      .from('products')
      .select('id, name, slug, category, default_unit, allowed_units, photo_url')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(limit);

    if (category) {
      builder = builder.eq('category', category);
    }

    const { data, error } = await builder;

    if (error) {
      throw error;
    }

    return ((data as ProductRow[]) ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category,
      defaultUnit: row.default_unit,
      allowedUnits: row.allowed_units,
      photoUrl: row.photo_url,
      matchScore: 1,
    }));
  }

  async getCategories(): Promise<ProductCategorySummary[]> {
    const { data, error } = await this.supabase.db
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    const counts = new Map<string, number>();

    for (const row of data ?? []) {
      const category = (row as { category: string }).category;
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([category, productCount]) => ({ category, productCount }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }
}

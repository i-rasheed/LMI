import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ProductsService } from '../products/products.service';
import { FavouriteItem, FavouriteRow } from './favourites.types';

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class FavouritesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly productsService: ProductsService,
  ) {}

  async listFavourites(userId: string): Promise<FavouriteItem[]> {
    const { data, error } = await this.supabase.db
      .from('favourites')
      .select(
        `
        id,
        product_id,
        created_at,
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as unknown as FavouriteRow[]) ?? []).map((row) =>
      this.mapFavourite(row),
    );
  }

  async addFavourite(userId: string, productId: string): Promise<FavouriteItem> {
    await this.productsService.getProductById(productId);

    const existing = await this.findFavourite(userId, productId);
    if (existing) {
      return existing;
    }

    await this.assertFreemiumAvailable(userId);

    const { data, error } = await this.supabase.db
      .from('favourites')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select(
        `
        id,
        product_id,
        created_at,
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
      .single();

    if (error) {
      if (error.code === '23505') {
        const raced = await this.findFavourite(userId, productId);
        if (raced) {
          return raced;
        }
        throw new ConflictException('Product already saved');
      }
      throw error;
    }

    return this.mapFavourite(data as unknown as FavouriteRow);
  }

  async removeFavourite(userId: string, productId: string): Promise<void> {
    const { error } = await this.supabase.db
      .from('favourites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw error;
    }
  }

  private async findFavourite(
    userId: string,
    productId: string,
  ): Promise<FavouriteItem | null> {
    const { data, error } = await this.supabase.db
      .from('favourites')
      .select(
        `
        id,
        product_id,
        created_at,
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
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? this.mapFavourite(data as unknown as FavouriteRow) : null;
  }

  private async assertFreemiumAvailable(userId: string): Promise<void> {
    const { data, error } = await this.supabase.db.rpc(
      'check_freemium_limit',
      {
        p_user_id: userId,
        p_resource: 'favourites',
      },
    );

    if (error) {
      throw error;
    }

    if (!data) {
      throw new HttpException(
        {
          code: 'FREEMIUM_LIMIT',
          message: 'Free accounts can save up to 10 favourites.',
          resource: 'favourites',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  private mapFavourite(row: FavouriteRow): FavouriteItem {
    const product = first(row.products);

    return {
      id: row.id,
      productId: row.product_id,
      createdAt: row.created_at,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        defaultUnit: product.default_unit,
        photoUrl: product.photo_url,
      },
    };
  }
}

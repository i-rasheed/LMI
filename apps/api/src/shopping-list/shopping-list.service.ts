import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ProductsService } from '../products/products.service';
import { AddListItemInput } from './shopping-list.dto';
import {
  CurrentPriceJoinRow,
  OptimiseResult,
  OptimisedMarket,
  ProductJoinRow,
  ShoppingListItem,
  ShoppingListItemRow,
} from './shopping-list.types';

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class ShoppingListService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly productsService: ProductsService,
  ) {}

  async listItems(userId: string): Promise<ShoppingListItem[]> {
    const listId = await this.getOrCreateListId(userId);

    const { data, error } = await this.supabase.db
      .from('shopping_list_items')
      .select(this.itemSelect())
      .eq('list_id', listId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data as unknown as ShoppingListItemRow[]) ?? []).map((row) =>
      this.mapItem(row),
    );
  }

  async addItem(
    userId: string,
    input: AddListItemInput,
  ): Promise<ShoppingListItem> {
    await this.productsService.getProductById(input.productId);
    const listId = await this.getOrCreateListId(userId);

    const existing = await this.findItem(listId, input.productId);
    if (existing) {
      return existing;
    }

    await this.assertFreemiumAvailable(userId);

    const sortOrder = await this.getNextSortOrder(listId);

    const { data, error } = await this.supabase.db
      .from('shopping_list_items')
      .insert({
        list_id: listId,
        product_id: input.productId,
        quantity: input.quantity,
        sort_order: sortOrder,
      })
      .select(this.itemSelect())
      .single();

    if (error) {
      if (error.code === '23505') {
        const raced = await this.findItem(listId, input.productId);
        if (raced) {
          return raced;
        }
      }
      throw error;
    }

    return this.mapItem(data as unknown as ShoppingListItemRow);
  }

  async deleteItem(userId: string, itemId: string): Promise<void> {
    const listId = await this.getOrCreateListId(userId);

    const { error } = await this.supabase.db
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId)
      .eq('list_id', listId);

    if (error) {
      throw error;
    }
  }

  async optimise(userId: string): Promise<OptimiseResult> {
    const items = await this.listItems(userId);
    if (items.length === 0) {
      return {
        bestMarket: null,
        markets: [],
        itemCount: 0,
      };
    }

    const prices = await this.fetchCurrentPrices(items);
    const marketsById = new Map<string, OptimisedMarket>();

    for (const price of prices) {
      const market = first(price.markets);
      if (!marketsById.has(market.id)) {
        marketsById.set(market.id, {
          marketId: market.id,
          marketName: market.name,
          marketArea: market.area,
          totalCostNaira: 0,
          coverageCount: 0,
          itemCount: items.length,
          breakdown: [],
        });
      }
    }

    for (const market of marketsById.values()) {
      for (const item of items) {
        const product = item.product;
        const price = prices.find(
          (candidate) =>
            candidate.market_id === market.marketId &&
            candidate.product_id === item.productId,
        );

        if (!price) {
          market.breakdown.push({
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unit: product.defaultUnit,
            priceNaira: null,
            lineTotalNaira: null,
          });
          continue;
        }

        const lineTotal = price.price_naira * item.quantity;
        market.totalCostNaira += lineTotal;
        market.coverageCount += 1;
        market.breakdown.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unit: price.unit,
          priceNaira: price.price_naira,
          lineTotalNaira: lineTotal,
        });
      }
    }

    const markets = [...marketsById.values()].sort((a, b) => {
      if (b.coverageCount !== a.coverageCount) {
        return b.coverageCount - a.coverageCount;
      }
      return a.totalCostNaira - b.totalCostNaira;
    });

    return {
      bestMarket: markets[0] ?? null,
      markets,
      itemCount: items.length,
    };
  }

  private async fetchCurrentPrices(
    items: ShoppingListItem[],
  ): Promise<CurrentPriceJoinRow[]> {
    const productIds = items.map((item) => item.productId);
    const defaultUnits = new Map(
      items.map((item) => [item.productId, item.product.defaultUnit]),
    );

    const { data, error } = await this.supabase.db
      .from('current_prices')
      .select(
        `
        product_id,
        market_id,
        price_naira,
        unit,
        markets!inner (
          id,
          name,
          area
        )
      `,
      )
      .in('product_id', productIds)
      .in('status', ['live', 'flagged', 'under_review']);

    if (error) {
      throw error;
    }

    return ((data as unknown as CurrentPriceJoinRow[]) ?? []).filter(
      (row) => row.unit === defaultUnits.get(row.product_id),
    );
  }

  private async getOrCreateListId(userId: string): Promise<string> {
    const { data: existing, error } = await this.supabase.db
      .from('shopping_lists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (existing) {
      return existing.id as string;
    }

    const { data, error: insertError } = await this.supabase.db
      .from('shopping_lists')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: raced, error: racedError } = await this.supabase.db
          .from('shopping_lists')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (racedError) {
          throw racedError;
        }
        return raced.id as string;
      }
      throw insertError;
    }

    return data.id as string;
  }

  private async findItem(
    listId: string,
    productId: string,
  ): Promise<ShoppingListItem | null> {
    const { data, error } = await this.supabase.db
      .from('shopping_list_items')
      .select(this.itemSelect())
      .eq('list_id', listId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? this.mapItem(data as unknown as ShoppingListItemRow) : null;
  }

  private async getNextSortOrder(listId: string): Promise<number> {
    const { data, error } = await this.supabase.db
      .from('shopping_list_items')
      .select('sort_order')
      .eq('list_id', listId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return ((data?.sort_order as number | undefined) ?? -1) + 1;
  }

  private async assertFreemiumAvailable(userId: string): Promise<void> {
    const { data, error } = await this.supabase.db.rpc(
      'check_freemium_limit',
      {
        p_user_id: userId,
        p_resource: 'list_items',
      },
    );

    if (error) {
      throw error;
    }

    if (!data) {
      throw new HttpException(
        {
          code: 'FREEMIUM_LIMIT',
          message: 'Free accounts can keep up to 5 list items.',
          resource: 'list_items',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  private itemSelect(): string {
    return `
      id,
      product_id,
      quantity,
      sort_order,
      created_at,
      products!inner (
        id,
        name,
        slug,
        category,
        default_unit,
        photo_url
      )
    `;
  }

  private mapItem(row: ShoppingListItemRow): ShoppingListItem {
    const product = first(row.products) as ProductJoinRow;

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      sortOrder: row.sort_order,
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

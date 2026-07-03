import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AlertInput } from '@lmi/shared';
import { SupabaseService } from '../supabase/supabase.service';
import { ProductsService } from '../products/products.service';
import {
  PriceAlertItem,
  PriceAlertRow,
  ProductJoinRow,
} from './alerts.types';
import { UpdateAlertInput } from './alerts.dto';

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class AlertsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly productsService: ProductsService,
  ) {}

  async listAlerts(userId: string): Promise<PriceAlertItem[]> {
    const { data, error } = await this.supabase.db
      .from('price_alerts')
      .select(
        `
        id,
        product_id,
        threshold_percentage,
        is_active,
        last_triggered_at,
        last_known_price_naira,
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as unknown as PriceAlertRow[]) ?? []).map((row) =>
      this.mapAlert(row),
    );
  }

  async createAlert(
    userId: string,
    input: AlertInput,
  ): Promise<PriceAlertItem> {
    await this.productsService.getProductById(input.productId);

    const existing = await this.findAlertForProduct(userId, input.productId);
    if (existing) {
      if (!existing.isActive && input.isActive !== false) {
        await this.assertFreemiumAvailable(userId);
      }
      return this.updateAlert(userId, existing.id, {
        thresholdPercentage: input.thresholdPercentage,
        isActive: input.isActive,
      });
    }

    if (input.isActive !== false) {
      await this.assertFreemiumAvailable(userId);
    }

    const lastKnownPriceNaira = await this.getCurrentLowestPrice(input.productId);

    const { data, error } = await this.supabase.db
      .from('price_alerts')
      .insert({
        user_id: userId,
        product_id: input.productId,
        threshold_percentage: input.thresholdPercentage,
        is_active: input.isActive,
        last_known_price_naira: lastKnownPriceNaira,
      })
      .select(this.alertSelect())
      .single();

    if (error) {
      throw error;
    }

    return this.mapAlert(data as unknown as PriceAlertRow);
  }

  async updateAlert(
    userId: string,
    alertId: string,
    input: UpdateAlertInput,
  ): Promise<PriceAlertItem> {
    const existing = await this.getOwnedAlertRow(userId, alertId);

    if (!existing.is_active && input.isActive === true) {
      await this.assertFreemiumAvailable(userId);
    }

    const update: Record<string, unknown> = {};
    if (input.thresholdPercentage != null) {
      update.threshold_percentage = input.thresholdPercentage;
    }
    if (input.isActive != null) {
      update.is_active = input.isActive;
    }
    if (Object.keys(update).length === 0) {
      return this.mapAlert(existing);
    }

    update.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase.db
      .from('price_alerts')
      .update(update)
      .eq('id', alertId)
      .eq('user_id', userId)
      .select(this.alertSelect())
      .single();

    if (error) {
      throw error;
    }

    return this.mapAlert(data as unknown as PriceAlertRow);
  }

  async deleteAlert(userId: string, alertId: string): Promise<void> {
    const { error } = await this.supabase.db
      .from('price_alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }

  private async getOwnedAlertRow(
    userId: string,
    alertId: string,
  ): Promise<PriceAlertRow> {
    const { data, error } = await this.supabase.db
      .from('price_alerts')
      .select(this.alertSelect())
      .eq('id', alertId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Alert not found');
    }

    const { data: owner, error: ownerError } = await this.supabase.db
      .from('price_alerts')
      .select('user_id')
      .eq('id', alertId)
      .single();

    if (ownerError) {
      throw ownerError;
    }

    if (owner.user_id !== userId) {
      throw new ForbiddenException('You can only update your own alerts');
    }

    return data as unknown as PriceAlertRow;
  }

  private async findAlertForProduct(
    userId: string,
    productId: string,
  ): Promise<PriceAlertItem | null> {
    const { data, error } = await this.supabase.db
      .from('price_alerts')
      .select(this.alertSelect())
      .eq('user_id', userId)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? this.mapAlert(data as unknown as PriceAlertRow) : null;
  }

  private async assertFreemiumAvailable(userId: string): Promise<void> {
    const { data, error } = await this.supabase.db.rpc(
      'check_freemium_limit',
      {
        p_user_id: userId,
        p_resource: 'alerts',
      },
    );

    if (error) {
      throw error;
    }

    if (!data) {
      throw new HttpException(
        {
          code: 'FREEMIUM_LIMIT',
          message: 'Free accounts can keep up to 3 active alerts.',
          resource: 'alerts',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  private async getCurrentLowestPrice(
    productId: string,
  ): Promise<number | null> {
    const { data, error } = await this.supabase.db
      .from('current_prices')
      .select('price_naira')
      .eq('product_id', productId)
      .in('status', ['live', 'flagged', 'under_review'])
      .order('price_naira', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.price_naira ?? null;
  }

  private alertSelect(): string {
    return `
      id,
      product_id,
      threshold_percentage,
      is_active,
      last_triggered_at,
      last_known_price_naira,
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
    `;
  }

  private mapAlert(row: PriceAlertRow): PriceAlertItem {
    const product = first(row.products) as ProductJoinRow;

    return {
      id: row.id,
      productId: row.product_id,
      thresholdPercentage: row.threshold_percentage,
      isActive: row.is_active,
      lastTriggeredAt: row.last_triggered_at,
      lastKnownPriceNaira: row.last_known_price_naira,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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

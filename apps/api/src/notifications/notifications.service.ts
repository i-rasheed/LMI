import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { SupabaseService } from '../supabase/supabase.service';
import { DeviceTokenInput } from './notifications.dto';
import {
  CreateNotificationInput,
  CurrentPriceSnapshot,
  NotificationItem,
  NotificationRow,
  PriceAlertEvaluationRow,
  PushDeviceRow,
} from './notifications.types';

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class NotificationsService {
  private readonly expo = new Expo();
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async registerDevice(
    userId: string,
    input: DeviceTokenInput,
  ): Promise<{ registered: true }> {
    if (!Expo.isExpoPushToken(input.expoPushToken)) {
      throw new BadRequestException('Invalid Expo push token');
    }

    const { error } = await this.supabase.db.from('push_devices').upsert(
      {
        user_id: userId,
        expo_push_token: input.expoPushToken,
        device_id: input.deviceId ?? null,
        platform: input.platform,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,expo_push_token' },
    );

    if (error) {
      throw error;
    }

    return { registered: true };
  }

  async listInbox(userId: string): Promise<NotificationItem[]> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await this.supabase.db
      .from('notifications')
      .select('id, user_id, type, title, body, data, read_at, sent_at, created_at')
      .eq('user_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as NotificationRow[]) ?? []).map(this.mapNotification);
  }

  async markRead(
    userId: string,
    notificationId: string,
  ): Promise<{ read: true }> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase.db
      .from('notifications')
      .update({ read_at: now })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Notification not found');
    }

    return { read: true };
  }

  async createAndSend(input: CreateNotificationInput): Promise<NotificationItem> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase.db
      .from('notifications')
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data ?? {},
        sent_at: now,
      })
      .select('id, user_id, type, title, body, data, read_at, sent_at, created_at')
      .single();

    if (error) {
      throw error;
    }

    await this.sendPushToUser(input.userId, {
      title: input.title,
      body: input.body,
      data: input.data ?? {},
    });

    return this.mapNotification(data as NotificationRow);
  }

  @Cron('0 */15 * * * *')
  async evaluatePriceAlerts(): Promise<void> {
    const { data, error } = await this.supabase.db
      .from('price_alerts')
      .select(
        `
        id,
        user_id,
        product_id,
        threshold_percentage,
        is_active,
        last_known_price_naira,
        products!inner ( id, name )
      `,
      )
      .eq('is_active', true);

    if (error) {
      this.logger.error('Failed to load price alerts', error.message);
      return;
    }

    const alerts = (data as unknown as PriceAlertEvaluationRow[]) ?? [];
    const productIds = [...new Set(alerts.map((alert) => alert.product_id))];

    if (productIds.length === 0) {
      return;
    }

    const priceByProduct = await this.fetchLowestCurrentPrices(productIds);

    for (const alert of alerts) {
      const snapshot = priceByProduct.get(alert.product_id);
      if (!snapshot) {
        continue;
      }

      const lastKnown = alert.last_known_price_naira;
      const currentPrice = snapshot.price_naira;

      if (lastKnown == null || currentPrice >= lastKnown) {
        await this.updateAlertBaseline(alert.id, currentPrice, snapshot.market_id);
        continue;
      }

      const dropPercent = ((lastKnown - currentPrice) / lastKnown) * 100;
      const shouldNotify =
        alert.threshold_percentage === 0 ||
        dropPercent >= alert.threshold_percentage;

      if (!shouldNotify) {
        continue;
      }

      await this.updateAlertBaseline(alert.id, currentPrice, snapshot.market_id);

      const product = first(alert.products);
      const market = first(snapshot.markets);

      await this.createAndSend({
        userId: alert.user_id,
        type: 'price_drop',
        title: `${product.name} price dropped`,
        body: `Now ₦${currentPrice.toLocaleString()} / ${snapshot.unit} at ${market.name}.`,
        data: {
          route: `/product/${alert.product_id}`,
          productId: alert.product_id,
          marketId: snapshot.market_id,
          alertId: alert.id,
          priceNaira: currentPrice,
        },
      });

      await this.markAlertTriggered(alert.id);
    }
  }

  private async fetchLowestCurrentPrices(
    productIds: string[],
  ): Promise<Map<string, CurrentPriceSnapshot>> {
    const { data, error } = await this.supabase.db
      .from('current_prices')
      .select(
        `
        product_id,
        market_id,
        price_naira,
        unit,
        markets!inner ( id, name )
      `,
      )
      .in('product_id', productIds)
      .in('status', ['live', 'flagged', 'under_review'])
      .order('price_naira', { ascending: true });

    if (error) {
      this.logger.error('Failed to load current prices', error.message);
      return new Map();
    }

    const map = new Map<string, CurrentPriceSnapshot>();
    for (const row of (data as unknown as CurrentPriceSnapshot[]) ?? []) {
      if (!map.has(row.product_id)) {
        map.set(row.product_id, row);
      }
    }
    return map;
  }

  private async updateAlertBaseline(
    alertId: string,
    priceNaira: number,
    marketId: string,
  ): Promise<void> {
    const { error } = await this.supabase.db
      .from('price_alerts')
      .update({
        last_known_price_naira: priceNaira,
        last_known_market_id: marketId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      this.logger.error(`Failed to update alert ${alertId}`, error.message);
    }
  }

  private async markAlertTriggered(alertId: string): Promise<void> {
    const { error } = await this.supabase.db
      .from('price_alerts')
      .update({
        last_triggered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      this.logger.error(`Failed to mark alert ${alertId} triggered`, error.message);
    }
  }

  private async sendPushToUser(
    userId: string,
    message: Omit<ExpoPushMessage, 'to'>,
  ): Promise<void> {
    const { data, error } = await this.supabase.db
      .from('push_devices')
      .select('id, expo_push_token')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      this.logger.error(`Failed to load push devices for ${userId}`, error.message);
      return;
    }

    const devices = (data as Pick<PushDeviceRow, 'id' | 'expo_push_token'>[]) ?? [];
    const messages: ExpoPushMessage[] = devices
      .filter((device) => Expo.isExpoPushToken(device.expo_push_token))
      .map((device) => ({
        ...message,
        to: device.expo_push_token,
        sound: 'default',
      }));

    for (const chunk of this.expo.chunkPushNotifications(messages)) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (sendError) {
        this.logger.error('Expo push send failed', sendError);
      }
    }
  }

  private mapNotification(row: NotificationRow): NotificationItem {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      data: row.data ?? {},
      readAt: row.read_at,
      sentAt: row.sent_at,
      createdAt: row.created_at,
    };
  }
}

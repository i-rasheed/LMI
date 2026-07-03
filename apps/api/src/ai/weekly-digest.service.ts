import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AiService } from './ai.service';

@Injectable()
export class WeeklyDigestService {
  private readonly logger = new Logger(WeeklyDigestService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
    private readonly supabase: SupabaseService,
  ) {}

  @Cron('0 0 9 * * 1')
  async sendPremiumWeeklyDigests(): Promise<void> {
    const { data, error } = await this.supabase.db
      .from('subscriptions')
      .select('user_id, current_period_end')
      .eq('subscription_type', 'shopper_premium')
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    for (const row of (data as Array<{ user_id: string; current_period_end: string | null }>) ?? []) {
      if (
        row.current_period_end &&
        new Date(row.current_period_end).getTime() <= Date.now()
      ) {
        continue;
      }

      try {
        const digest = await this.aiService.digest({});
        await this.notificationsService.createAndSend({
          userId: row.user_id,
          type: 'weekly_digest',
          title: digest.title,
          body: digest.body,
          data: { highlights: digest.highlights },
        });
      } catch (error) {
        this.logger.warn(
          `Weekly digest failed for ${row.user_id}: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      }
    }
  }
}

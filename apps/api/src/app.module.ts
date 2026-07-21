import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppConfigModule } from './app-config/app-config.module';
import { HealthModule } from './health/health.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UsersModule } from './users/users.module';
import { MarketsModule } from './markets/markets.module';
import { ProductsModule } from './products/products.module';
import { PricesModule } from './prices/prices.module';
import { AdminModule } from './admin/admin.module';
import { FavouritesModule } from './favourites/favourites.module';
import { AlertsModule } from './alerts/alerts.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { VendorsModule } from './vendors/vendors.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
    SupabaseModule,
    HealthModule,
    AppConfigModule,
    UsersModule,
    MarketsModule,
    ProductsModule,
    PricesModule,
    AdminModule,
    FavouritesModule,
    AlertsModule,
    ShoppingListModule,
    VendorsModule,
    NotificationsModule,
    SubscriptionsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

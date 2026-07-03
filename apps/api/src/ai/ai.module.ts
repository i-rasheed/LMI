import { Module } from '@nestjs/common';
import { AdminRoleGuard } from '../common/guards/admin-role.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductsModule } from '../products/products.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { WeeklyDigestService } from './weekly-digest.service';

@Module({
  imports: [ProductsModule, NotificationsModule],
  controllers: [AiController],
  providers: [AiService, WeeklyDigestService, AdminRoleGuard],
  exports: [AiService],
})
export class AiModule {}

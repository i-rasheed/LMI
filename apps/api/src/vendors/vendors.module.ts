import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { VendorRoleGuard } from '../common/guards/vendor-role.guard';
import { VendorEventsController } from './vendor-events.controller';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [ProductsModule, SubscriptionsModule],
  controllers: [VendorsController, VendorEventsController],
  providers: [VendorsService, VendorRoleGuard],
  exports: [VendorsService],
})
export class VendorsModule {}

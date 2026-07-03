import { Module } from '@nestjs/common';
import { ReporterRoleGuard } from '../common/guards/reporter-role.guard';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';

@Module({
  imports: [UsersModule, ProductsModule],
  controllers: [PricesController],
  providers: [PricesService, ReporterRoleGuard],
  exports: [PricesService],
})
export class PricesModule {}

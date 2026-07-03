import { Module } from '@nestjs/common';
import { AdminRoleGuard } from '../common/guards/admin-role.guard';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminFlagsService } from './admin-flags.service';
import { AdminClaimsService } from './admin-claims.service';
import { VendorsModule } from '../vendors/vendors.module';
import { VendorsService } from '../vendors/vendors.service';

@Module({
  imports: [UsersModule, VendorsModule],
  controllers: [AdminController],
  providers: [AdminFlagsService, AdminClaimsService, AdminRoleGuard],
  exports: [AdminFlagsService, AdminClaimsService],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { ReporterRoleGuard } from '../common/guards/reporter-role.guard';
import { ReportersController } from './reporters.controller';
import { ReportersService } from './reporters.service';

@Module({
  controllers: [ReportersController],
  providers: [ReportersService, ReporterRoleGuard],
  exports: [ReportersService],
})
export class ReportersModule {}

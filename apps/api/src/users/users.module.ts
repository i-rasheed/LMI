import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthGuard, ActiveAccountGuard],
  exports: [UsersService, AuthGuard],
})
export class UsersModule {}

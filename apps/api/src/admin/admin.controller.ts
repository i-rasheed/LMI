import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { adminFlagActionSchema, adminClaimActionSchema } from '@lmi/shared';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '../common/guards/auth.guard';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { AdminRoleGuard } from '../common/guards/admin-role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../users/users.types';
import { AdminFlagsService } from './admin-flags.service';
import { AdminClaimsService } from './admin-claims.service';
import { VendorsService } from '../vendors/vendors.service';
import { flagQueueQuerySchema, FlagQueueQuery } from './admin.dto';

class AdminFlagActionDto extends createZodDto(adminFlagActionSchema) {}
class AdminClaimActionDto extends createZodDto(adminClaimActionSchema) {}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AuthGuard, ActiveAccountGuard, AdminRoleGuard)
export class AdminController {
  constructor(
    private readonly adminFlagsService: AdminFlagsService,
    private readonly adminClaimsService: AdminClaimsService,
    private readonly vendorsService: VendorsService,
  ) {}

  @Get('flags')
  @ApiOperation({ summary: 'List unresolved flag reviews' })
  listFlags(
    @Query(new ZodValidationPipe(flagQueueQuerySchema)) query: FlagQueueQuery,
  ) {
    return this.adminFlagsService.listFlagQueue(query);
  }

  @Get('flags/:id')
  @ApiOperation({ summary: 'Get flag review detail' })
  getFlag(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminFlagsService.getFlagReview(id);
  }

  @Patch('flags/:id')
  @ApiOperation({ summary: 'Apply moderation action to flagged submission' })
  patchFlag(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(adminFlagActionSchema)) body: AdminFlagActionDto,
  ) {
    return this.adminFlagsService.applyFlagAction(user.id, id, body);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard summary' })
  async getDashboard() {
    const [pendingFlags, pendingClaims] = await Promise.all([
      this.adminFlagsService.getPendingFlagCount(),
      this.vendorsService.getPendingClaimCount(),
    ]);
    return {
      pendingFlags,
      pendingClaims,
      activeUsers7d: null,
    };
  }

  @Get('claims')
  @ApiOperation({ summary: 'Pending stall claim queue' })
  listClaims() {
    return this.adminClaimsService.listClaimQueue();
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Stall claim review detail' })
  getClaim(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminClaimsService.getClaimReview(id);
  }

  @Patch('claims/:id')
  @ApiOperation({ summary: 'Approve or reject a stall claim' })
  patchClaim(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(adminClaimActionSchema)) body: AdminClaimActionDto,
  ) {
    return this.adminClaimsService.applyClaimAction(user.id, id, body);
  }
}

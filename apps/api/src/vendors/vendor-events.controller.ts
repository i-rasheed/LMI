import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { AuthUser } from '../users/users.types';
import { vendorAnalyticsEventSchema } from './vendors.dto';
import { VendorsService } from './vendors.service';

class VendorAnalyticsEventDto extends createZodDto(vendorAnalyticsEventSchema) {}

@ApiTags('vendors')
@ApiBearerAuth()
@Controller('vendors')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class VendorEventsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post('analytics/event')
  @ApiOperation({ summary: 'Record vendor analytics event' })
  recordEvent(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(vendorAnalyticsEventSchema))
    body: VendorAnalyticsEventDto,
  ) {
    return this.vendorsService.recordAnalyticsEvent(user.id, body);
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { AuthUser } from '../users/users.types';
import { initializeSubscriptionSchema } from './subscriptions.dto';
import { SubscriptionsService } from './subscriptions.service';

class InitializeSubscriptionDto extends createZodDto(
  initializeSubscriptionSchema,
) {}

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List shopper premium plans' })
  listPlans() {
    return this.subscriptionsService.listPlans();
  }

  @Get('me')
  @ApiOperation({ summary: 'Current subscription status' })
  getMine(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.getMine(user.id);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize Paystack checkout' })
  initialize(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(initializeSubscriptionSchema))
    body: InitializeSubscriptionDto,
  ) {
    return this.subscriptionsService.initialize(user, body);
  }
}

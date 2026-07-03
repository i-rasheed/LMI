import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  stallClaimSchema,
  updateVendorProductSchema,
  vendorProductSchema,
} from '@lmi/shared';
import { initializeSubscriptionSchema } from '../subscriptions/subscriptions.dto';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '../common/guards/auth.guard';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { VendorRoleGuard } from '../common/guards/vendor-role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../users/users.types';
import { VendorsService } from './vendors.service';

class StallClaimDto extends createZodDto(stallClaimSchema) {}
class VendorProductDto extends createZodDto(vendorProductSchema) {}
class UpdateVendorProductDto extends createZodDto(updateVendorProductSchema) {}
class InitializeVendorSubscriptionDto extends createZodDto(
  initializeSubscriptionSchema,
) {}

@ApiTags('vendors')
@ApiBearerAuth()
@Controller('vendors')
@UseGuards(AuthGuard, ActiveAccountGuard, VendorRoleGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post('claim')
  @ApiOperation({ summary: 'Submit a stall claim' })
  submitClaim(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(stallClaimSchema)) body: StallClaimDto,
  ) {
    return this.vendorsService.submitClaim(user.id, body);
  }

  @Get('claim/status')
  @ApiOperation({ summary: 'Get current stall claim status' })
  getClaimStatus(@CurrentUser() user: AuthUser) {
    return this.vendorsService.getClaimStatus(user.id);
  }

  @Patch('claim')
  @ApiOperation({ summary: 'Resubmit a rejected stall claim' })
  resubmitClaim(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(stallClaimSchema)) body: StallClaimDto,
  ) {
    return this.vendorsService.resubmitClaim(user.id, body);
  }

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Vendor dashboard summary' })
  getDashboard(@CurrentUser() user: AuthUser) {
    return this.vendorsService.getDashboard(user.id);
  }

  @Get('subscription/plans')
  @ApiOperation({ summary: 'List vendor subscription plans' })
  listSubscriptionPlans() {
    return this.vendorsService.listSubscriptionPlans();
  }

  @Post('subscription/initialize')
  @ApiOperation({ summary: 'Initialize Paystack checkout for vendor plan' })
  initializeSubscription(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(initializeSubscriptionSchema))
    body: InitializeVendorSubscriptionDto,
  ) {
    return this.vendorsService.initializeSubscription(
      user,
      body.planId,
      body.callbackUrl,
    );
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Vendor Pro analytics summary' })
  getAnalytics(@CurrentUser() user: AuthUser) {
    return this.vendorsService.getAnalytics(user.id);
  }

  @Get('products')
  @ApiOperation({ summary: 'List vendor product listings' })
  listProducts(@CurrentUser() user: AuthUser) {
    return this.vendorsService.listProducts(user.id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Add a vendor product listing' })
  addProduct(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(vendorProductSchema)) body: VendorProductDto,
  ) {
    return this.vendorsService.addProduct(user.id, body);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update a vendor product listing' })
  updateProduct(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateVendorProductSchema))
    body: UpdateVendorProductDto,
  ) {
    return this.vendorsService.updateProduct(user.id, id, body);
  }
}

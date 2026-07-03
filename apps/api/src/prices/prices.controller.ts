import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  submitPriceSchema,
  flagPriceBodySchema,
  type FlagPriceBodyInput,
  type SubmitPriceInput,
} from '@lmi/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '../common/guards/auth.guard';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { ReporterRoleGuard } from '../common/guards/reporter-role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../users/users.types';
import {
  comparePricesQuerySchema,
  ComparePricesQuery,
  marketAverageQuerySchema,
  MarketAverageQuery,
} from './prices.dto';
import { PricesService } from './prices.service';

@ApiTags('prices')
@ApiBearerAuth()
@Controller('prices')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get('average')
  @ApiOperation({ summary: '7-day market average for price preview' })
  getAverage(
    @Query(new ZodValidationPipe(marketAverageQuerySchema))
    query: MarketAverageQuery,
  ) {
    return this.pricesService.getMarketAverage(
      query.productId,
      query.marketId,
      query.unit,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new price (reporter)' })
  @UseGuards(ReporterRoleGuard)
  submit(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(submitPriceSchema)) body: SubmitPriceInput,
  ) {
    return this.pricesService.submitPrice(user.id, body);
  }

  @Post(':submissionId/flag')
  @ApiOperation({ summary: 'Flag an incorrect price' })
  flag(
    @CurrentUser() user: AuthUser,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body(new ZodValidationPipe(flagPriceBodySchema)) body: FlagPriceBodyInput,
  ) {
    return this.pricesService.flagSubmission(user.id, submissionId, body);
  }

  @Patch(':submissionId')
  @ApiOperation({ summary: 'Update an existing price submission' })
  @UseGuards(ReporterRoleGuard)
  update(
    @CurrentUser() user: AuthUser,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body(new ZodValidationPipe(submitPriceSchema)) body: SubmitPriceInput,
  ) {
    return this.pricesService.updatePrice(user.id, submissionId, body);
  }

  @Get(':productId/compare')
  @ApiOperation({ summary: 'Compare prices for a product across markets' })
  compare(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query(new ZodValidationPipe(comparePricesQuerySchema))
    query: ComparePricesQuery,
  ) {
    return this.pricesService.compareProduct(productId, {
      sort: query.sort,
      lat: query.lat,
      lng: query.lng,
      area: query.area,
      maxDistanceKm: query.max_distance_km,
      updatedWithinHours: query.updated_within_hours,
    });
  }

  @Get(':productId/history')
  @ApiOperation({ summary: 'Premium price history for a product' })
  getHistory(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.pricesService.getPriceHistory(user.id, productId);
  }
}

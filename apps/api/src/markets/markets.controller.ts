import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '../common/guards/auth.guard';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import {
  listMarketsQuerySchema,
  ListMarketsQuery,
  nearbyMarketsQuerySchema,
  NearbyMarketsQueryDto,
} from './markets.dto';
import { MarketsService } from './markets.service';

@ApiTags('markets')
@ApiBearerAuth()
@Controller('markets')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  @ApiOperation({ summary: 'List active markets' })
  list(
    @Query(new ZodValidationPipe(listMarketsQuerySchema)) query: ListMarketsQuery,
  ) {
    return this.marketsService.listMarkets({
      area: query.area,
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radius_km,
      limit: query.limit,
    });
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Markets sorted by distance from coordinates' })
  nearby(
    @Query(new ZodValidationPipe(nearbyMarketsQuerySchema))
    query: NearbyMarketsQueryDto,
  ) {
    return this.marketsService.getNearbyMarkets({
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radius_km,
      limit: query.limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Market profile with popular prices' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketsService.getMarketById(id);
  }
}

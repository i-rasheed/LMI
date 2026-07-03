import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '../common/guards/auth.guard';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import {
  listProductsQuerySchema,
  ListProductsQuery,
  productSearchQuerySchema,
  ProductSearchQuery,
  trendingProductsQuerySchema,
  TrendingProductsQuery,
} from './products.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search products (FTS + trigram aliases)' })
  search(
    @Query(new ZodValidationPipe(productSearchQuerySchema))
    query: ProductSearchQuery,
  ) {
    return this.productsService.searchProducts(query.q, query.limit);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Trending products by recent search volume' })
  trending(
    @Query(new ZodValidationPipe(trendingProductsQuerySchema))
    query: TrendingProductsQuery,
  ) {
    return this.productsService.getTrendingProducts(query.limit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Product categories with counts' })
  categories() {
    return this.productsService.getCategories();
  }

  @Get()
  @ApiOperation({ summary: 'List products, optionally filtered by category' })
  list(
    @Query(new ZodValidationPipe(listProductsQuerySchema)) query: ListProductsQuery,
  ) {
    return this.productsService.listProducts(query.category, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Product detail' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getProductById(id);
  }
}

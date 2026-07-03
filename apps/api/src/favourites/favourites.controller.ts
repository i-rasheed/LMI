import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '../common/guards/auth.guard';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../users/users.types';
import { favouriteBodySchema } from './favourites.dto';
import { FavouritesService } from './favourites.service';

class FavouriteBodyDto extends createZodDto(favouriteBodySchema) {}

@ApiTags('favourites')
@ApiBearerAuth()
@Controller('favourites')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get()
  @ApiOperation({ summary: 'List saved favourite products' })
  list(@CurrentUser() user: AuthUser) {
    return this.favouritesService.listFavourites(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Save a favourite product' })
  add(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(favouriteBodySchema)) body: FavouriteBodyDto,
  ) {
    return this.favouritesService.addFavourite(user.id, body.productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a favourite product' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    await this.favouritesService.removeFavourite(user.id, productId);
    return { deleted: true };
  }
}

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
import { addListItemSchema } from './shopping-list.dto';
import { ShoppingListService } from './shopping-list.service';

class AddListItemDto extends createZodDto(addListItemSchema) {}

@ApiTags('shopping-list')
@ApiBearerAuth()
@Controller('list')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Get('items')
  @ApiOperation({ summary: 'List shopping list items' })
  listItems(@CurrentUser() user: AuthUser) {
    return this.shoppingListService.listItems(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add shopping list item' })
  addItem(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(addListItemSchema)) body: AddListItemDto,
  ) {
    return this.shoppingListService.addItem(user.id, body);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete shopping list item' })
  async deleteItem(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.shoppingListService.deleteItem(user.id, id);
    return { deleted: true };
  }

  @Post('optimise')
  @ApiOperation({ summary: 'Find cheapest single market for shopping list' })
  optimise(@CurrentUser() user: AuthUser) {
    return this.shoppingListService.optimise(user.id);
  }
}

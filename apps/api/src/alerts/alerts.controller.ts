import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { alertSchema } from './alerts.dto';
import { updateAlertSchema } from './alerts.dto';
import { AlertsService } from './alerts.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../users/users.types';

class CreateAlertDto extends createZodDto(alertSchema) {}
class UpdateAlertDto extends createZodDto(updateAlertSchema) {}

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List price alerts' })
  list(@CurrentUser() user: AuthUser) {
    return this.alertsService.listAlerts(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create price alert' })
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(alertSchema)) body: CreateAlertDto,
  ) {
    return this.alertsService.createAlert(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update or toggle price alert' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateAlertSchema)) body: UpdateAlertDto,
  ) {
    return this.alertsService.updateAlert(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete price alert' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.alertsService.deleteAlert(user.id, id);
    return { deleted: true };
  }
}

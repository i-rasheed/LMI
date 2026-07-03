import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { AuthUser } from '../users/users.types';
import { deviceTokenSchema } from './notifications.dto';
import { NotificationsService } from './notifications.service';

class DeviceTokenDto extends createZodDto(deviceTokenSchema) {}

@ApiTags('devices')
@ApiBearerAuth()
@Controller('devices')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class DevicesController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('token')
  @ApiOperation({ summary: 'Register Expo push token for this device' })
  registerToken(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(deviceTokenSchema)) body: DeviceTokenDto,
  ) {
    return this.notificationsService.registerDevice(user.id, body);
  }
}

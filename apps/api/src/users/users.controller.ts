import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { deleteAccountSchema, roleSelectSchema } from '@lmi/shared';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser, ProfileResponse } from './users.types';
import { UsersService } from './users.service';

class SetRoleDto extends createZodDto(roleSelectSchema) {}
class DeleteAccountDto extends createZodDto(deleteAccountSchema) {}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: AuthUser): Promise<ProfileResponse> {
    return this.usersService.getMe(user);
  }

  @Post('me/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set primary role at signup' })
  @UseGuards(AuthGuard)
  setRole(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(roleSelectSchema)) body: SetRoleDto,
  ): Promise<ProfileResponse> {
    return this.usersService.setRole(user, body.role);
  }

  @Post('me/onboarding')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark onboarding walkthrough complete' })
  @UseGuards(AuthGuard)
  completeOnboarding(@CurrentUser() user: AuthUser): Promise<ProfileResponse> {
    return this.usersService.completeOnboarding(user);
  }

  @Post('me/guidelines')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept submission guidelines' })
  @UseGuards(AuthGuard)
  acceptGuidelines(@CurrentUser() user: AuthUser): Promise<ProfileResponse> {
    return this.usersService.acceptGuidelines(user);
  }

  @Get('me/warnings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unacknowledged account warnings' })
  @UseGuards(AuthGuard)
  getWarnings(@CurrentUser() user: AuthUser) {
    return this.usersService.getPendingWarnings(user);
  }

  @Post('me/warnings/:id/acknowledge')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Acknowledge an account warning' })
  @UseGuards(AuthGuard)
  acknowledgeWarning(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.acknowledgeWarning(user, id);
  }

  @Post('me/delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule account deletion with 7-day grace period' })
  @UseGuards(AuthGuard)
  requestDeletion(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(deleteAccountSchema)) body: DeleteAccountDto,
  ) {
    return this.usersService.requestAccountDeletion(user, body);
  }

  @Post('me/delete/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel pending account deletion' })
  @UseGuards(AuthGuard)
  cancelDeletion(@CurrentUser() user: AuthUser): Promise<ProfileResponse> {
    return this.usersService.cancelAccountDeletion(user);
  }
}

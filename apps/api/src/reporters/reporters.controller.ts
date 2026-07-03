import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { ReporterRoleGuard } from '../common/guards/reporter-role.guard';
import { AuthUser } from '../users/users.types';
import { ReportersService } from './reporters.service';

@ApiTags('reporters')
@ApiBearerAuth()
@Controller('reporters')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class ReportersController {
  constructor(private readonly reportersService: ReportersService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Top reporters this week' })
  getLeaderboard(@Query('limit') limit?: string) {
    const parsed = limit ? Number(limit) : 20;
    return this.reportersService.getLeaderboard(
      Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 50) : 20,
    );
  }

  @Get('me/submissions')
  @UseGuards(ReporterRoleGuard)
  @ApiOperation({ summary: 'Current reporter submission history' })
  getMineHistory(@CurrentUser() user: AuthUser) {
    return this.reportersService.getMineHistory(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public reporter profile' })
  getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportersService.getProfile(id);
  }
}

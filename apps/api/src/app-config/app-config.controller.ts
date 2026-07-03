import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppConfigService, AppConfigResponse } from './app-config.service';

@ApiTags('config')
@Controller('config')
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Public app configuration' })
  getConfig(): Promise<AppConfigResponse> {
    return this.appConfigService.getPublicConfig();
  }
}

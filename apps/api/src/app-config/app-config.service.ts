import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

export interface AppConfigResponse {
  minAppVersion: string;
  latestAppVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  updateUrl: string | null;
}

@Injectable()
export class AppConfigService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  async getPublicConfig(): Promise<AppConfigResponse> {
    const defaults: AppConfigResponse = {
      minAppVersion: this.config.get<string>('API_MIN_VERSION') ?? '1.0.0',
      latestAppVersion:
        this.config.get<string>('API_LATEST_VERSION') ??
        this.config.get<string>('API_MIN_VERSION') ??
        '1.0.0',
      maintenanceMode: false,
      maintenanceMessage: 'LMI is temporarily unavailable. Try again soon.',
      updateUrl: this.config.get<string>('APP_UPDATE_URL') ?? null,
    };

    const { data, error } = await this.supabase.db
      .from('app_config')
      .select('key, value')
      .in('key', [
        'min_app_version',
        'latest_app_version',
        'maintenance_mode',
        'maintenance_message',
        'update_url',
      ]);

    if (error || !data) {
      return defaults;
    }

    const configMap = Object.fromEntries(
      data.map((row: { key: string; value: unknown }) => [row.key, row.value]),
    );

    const minVersionRaw = configMap.min_app_version;
    const latestVersionRaw = configMap.latest_app_version;
    const maintenanceRaw = configMap.maintenance_mode;
    const maintenanceMessageRaw = configMap.maintenance_message;
    const updateUrlRaw = configMap.update_url;

    return {
      minAppVersion:
        typeof minVersionRaw === 'string'
          ? minVersionRaw
          : defaults.minAppVersion,
      latestAppVersion:
        typeof latestVersionRaw === 'string'
          ? latestVersionRaw
          : defaults.latestAppVersion,
      maintenanceMode:
        maintenanceRaw === true ||
        maintenanceRaw === 'true' ||
        maintenanceRaw === false
          ? maintenanceRaw === true || maintenanceRaw === 'true'
          : defaults.maintenanceMode,
      maintenanceMessage:
        typeof maintenanceMessageRaw === 'string'
          ? maintenanceMessageRaw
          : defaults.maintenanceMessage,
      updateUrl:
        typeof updateUrlRaw === 'string' && updateUrlRaw.trim()
          ? updateUrlRaw
          : defaults.updateUrl,
    };
  }
}

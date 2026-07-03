import { publicApiRequest } from '../lib/api';
import { AppConfig } from '../types/app-config';

export function fetchAppConfig(): Promise<AppConfig> {
  return publicApiRequest<AppConfig>('/config');
}

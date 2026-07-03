export interface AppConfig {
  minAppVersion: string;
  latestAppVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  updateUrl: string | null;
}

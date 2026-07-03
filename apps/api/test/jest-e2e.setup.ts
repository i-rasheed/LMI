import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env') });

if (!process.env.SUPABASE_URL?.trim()) {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
}

process.env.API_MIN_VERSION ??= '1.0.0';

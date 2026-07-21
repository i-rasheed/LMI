import { ApiError } from '../lib/api';
import { resolveApiUrl } from '../lib/api-url';

export function getProfileLoadError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return `Cannot reach the API at ${resolveApiUrl()}. Make sure the API is running and your phone is on the same Wi‑Fi.`;
    }

    if (error.status === 401) {
      return 'Your session could not be verified. Try signing in again.';
    }

    return error.message;
  }

  return 'Could not load your profile. Try again.';
}

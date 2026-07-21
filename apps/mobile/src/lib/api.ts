import { supabase } from './supabase';
import { resolveApiUrl } from './api-url';

const FETCH_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. Check that the API server is running.',
        0,
        'TIMEOUT',
      );
    }

    const message =
      error instanceof Error ? error.message : 'Network request failed';
    throw new ApiError(message, 0, 'NETWORK');
  } finally {
    clearTimeout(timeout);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAccessToken(explicitToken?: string): Promise<string | null> {
  if (explicitToken) {
    return explicitToken;
  }

  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    return data.session.access_token;
  }

  await new Promise((resolve) => setTimeout(resolve, 150));

  const { data: retry } = await supabase.auth.getSession();
  return retry.session?.access_token ?? null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const token = await getAccessToken(accessToken);

  if (!token) {
    throw new ApiError('Not authenticated', 401);
  }

  const response = await fetchWithTimeout(`${resolveApiUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = 'Request failed';
    let code: string | undefined;
    let details: Record<string, unknown> | undefined;

    try {
      const body = (await response.json()) as {
        message?: string | Record<string, unknown>;
        errors?: Array<{ message?: string; path?: Array<string | number> }>;
      };

      if (typeof body.message === 'string') {
        message = body.message;
      } else if (body.message && typeof body.message === 'object') {
        const payload = body.message;
        code =
          typeof payload.code === 'string' ? payload.code : undefined;
        message =
          typeof payload.message === 'string'
            ? payload.message
            : code ?? message;
        details = payload;
      }

      const fieldError = body.errors?.[0]?.message;
      if (fieldError && message === 'Validation failed') {
        message = fieldError;
      }
    } catch {
      // ignore parse errors
    }

    throw new ApiError(message, response.status, code, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function publicApiRequest<T>(path: string): Promise<T> {
  const response = await fetchWithTimeout(`${resolveApiUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new ApiError('Request failed', response.status);
  }

  return (await response.json()) as T;
}

import { supabase } from './supabase';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

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

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiError('Not authenticated', 401);
  }

  const response = await fetch(`${API_URL}${path}`, {
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
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new ApiError('Request failed', response.status);
  }

  return (await response.json()) as T;
}

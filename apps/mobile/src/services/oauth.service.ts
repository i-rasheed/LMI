import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getPostAuthRoute } from '../hooks/useAuthRedirect';
import { supabase } from '../lib/supabase';
import { ApiProfile } from '../types/profile';
import { fetchMe } from './auth.service';
import { syncProfileToStore } from './profile-sync';

WebBrowser.maybeCompleteAuthSession();

export class OAuthCancelledError extends Error {
  constructor() {
    super('Google sign-in was cancelled.');
    this.name = 'OAuthCancelledError';
  }
}

export async function signInWithGoogle(): Promise<ApiProfile> {
  const redirectTo = makeRedirectUri({
    scheme: 'lmi',
    path: 'auth/callback',
  });

  if (__DEV__) {
    console.log('[oauth] redirectTo =', redirectTo);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error('Google sign-in could not be started. Try again.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success') {
    throw new OAuthCancelledError();
  }

  await createSessionFromCallbackUrl(result.url);

  const profile = await fetchMe();
  syncProfileToStore(profile);
  return profile;
}

export function getGooglePostAuthRoute(profile: ApiProfile) {
  return getPostAuthRoute(profile);
}

async function createSessionFromCallbackUrl(callbackUrl: string): Promise<void> {
  const params = getCallbackParams(callbackUrl);
  const errorDescription = params.get('error_description') ?? params.get('error');

  if (errorDescription) {
    throw new Error(errorDescription);
  }

  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
    return;
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    throw new Error('Google sign-in did not return a valid session.');
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }
}

function getCallbackParams(callbackUrl: string): URLSearchParams {
  const parsed = new URL(callbackUrl);
  const params = new URLSearchParams(parsed.search);
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));

  hashParams.forEach((value, key) => {
    params.set(key, value);
  });

  return params;
}

import { SignupRole } from '@lmi/shared';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';
import { ApiProfile } from '../types/profile';

export function fetchMe(): Promise<ApiProfile> {
  return apiRequest<ApiProfile>('/users/me');
}

export function setRole(role: SignupRole): Promise<ApiProfile> {
  return apiRequest<ApiProfile>('/users/me/role', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export function completeOnboarding(): Promise<ApiProfile> {
  return apiRequest<ApiProfile>('/users/me/onboarding', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function acceptGuidelines(): Promise<ApiProfile> {
  return apiRequest<ApiProfile>('/users/me/guidelines', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function requestAccountDeletion(): Promise<{
  scheduled: true;
  permanentDeleteAt: string | null;
}> {
  return apiRequest('/users/me/delete', {
    method: 'POST',
    body: JSON.stringify({ confirmation: 'DELETE' }),
  });
}

export function cancelAccountDeletion(): Promise<ApiProfile> {
  return apiRequest<ApiProfile>('/users/me/delete/cancel', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'lmi://reset-password',
  });

  if (error) {
    throw error;
  }
}

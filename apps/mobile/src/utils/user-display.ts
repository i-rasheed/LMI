import type { User } from '@supabase/supabase-js';
import { UserRole } from '@lmi/shared';

interface ProfileNameSource {
  displayName: string | null;
}

export function looksLikeEmailLocalPart(
  name: string,
  email?: string | null,
): boolean {
  if (!email) {
    return false;
  }

  const localPart = email.split('@')[0]?.trim().toLowerCase();
  return Boolean(localPart) && name.trim().toLowerCase() === localPart;
}

function isUsableDisplayName(
  name: string | null | undefined,
  email?: string | null,
): name is string {
  if (!name?.trim()) {
    return false;
  }

  const trimmed = name.trim();
  if (trimmed.toLowerCase() === 'user') {
    return false;
  }

  if (looksLikeEmailLocalPart(trimmed, email)) {
    return false;
  }

  return true;
}

export function getUserDisplayName(
  profile: ProfileNameSource | null,
  user: User | null,
): string | null {
  const email = user?.email ?? null;

  if (isUsableDisplayName(profile?.displayName, email)) {
    return profile.displayName.trim();
  }

  const metadata = user?.user_metadata ?? {};
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && isUsableDisplayName(candidate, email)) {
      return candidate.trim();
    }
  }

  return null;
}

export function getGreetingFirstName(
  profile: ProfileNameSource | null,
  user: User | null,
): string | null {
  const displayName = getUserDisplayName(profile, user);
  if (!displayName) {
    return null;
  }

  return displayName.split(/\s+/)[0] ?? displayName;
}

export function formatUserRole(role: UserRole | null): string {
  switch (role) {
    case 'vendor':
      return 'Vendor';
    case 'admin':
      return 'Admin';
    default:
      return 'Shopper';
  }
}

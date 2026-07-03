export type FreshnessLevel = 'fresh' | 'stale' | 'outdated';

export interface FreshnessInfo {
  level: FreshnessLevel;
  label: string;
}

export function getFreshness(submittedAt: string): FreshnessInfo {
  const ageMs = Date.now() - new Date(submittedAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours < 24) {
    const hours = Math.max(1, Math.floor(ageHours));
    return { level: 'fresh', label: `Updated ${hours}h ago` };
  }

  if (ageHours <= 72) {
    const days = Math.max(1, Math.floor(ageHours / 24));
    return { level: 'stale', label: `Updated ${days}d ago` };
  }

  return { level: 'outdated', label: 'May be outdated' };
}

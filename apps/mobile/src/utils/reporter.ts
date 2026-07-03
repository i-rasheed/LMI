const BADGE_LABELS: Record<string, string> = {
  bronze: 'Bronze Reporter',
  silver: 'Silver Reporter',
  gold: 'Gold Reporter',
  elite: 'Elite Reporter',
};

const BADGE_DISPLAY: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  elite: 'Elite',
};

export function formatBadgeLabel(badgeLevel: string | null): string | null {
  if (!badgeLevel) {
    return null;
  }
  return BADGE_LABELS[badgeLevel] ?? `${badgeLevel} Reporter`;
}

export function formatBadgeName(badgeLevel: string | null): string | null {
  if (!badgeLevel) {
    return null;
  }
  return BADGE_DISPLAY[badgeLevel] ?? badgeLevel;
}

export function formatBadgeProgressText(
  count: number,
  nextBadgeLevel: string | null,
  submissionsUntilNextBadge: number | null,
): string | null {
  if (!nextBadgeLevel || submissionsUntilNextBadge == null) {
    return null;
  }

  const nextName = formatBadgeName(nextBadgeLevel);
  const target = count + submissionsUntilNextBadge;
  return `${count} / ${target} submissions to ${nextName}`;
}

import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface MarketHoursBadgeProps {
  openingHours: Record<string, unknown>;
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function getTodayKey(): string {
  return DAY_KEYS[new Date().getDay()];
}

function parseHours(openingHours: Record<string, unknown>): {
  isOpen: boolean;
  label: string;
} {
  const today = getTodayKey();
  const todayHours = openingHours[today] as
    | { open?: string; close?: string }
    | undefined;

  if (!todayHours?.open || !todayHours?.close) {
    return { isOpen: false, label: 'Hours unavailable' };
  }

  const now = new Date();
  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const openDate = new Date(now);
  openDate.setHours(openH, openM, 0, 0);
  const closeDate = new Date(now);
  closeDate.setHours(closeH, closeM, 0, 0);

  const isOpen = now >= openDate && now <= closeDate;
  return {
    isOpen,
    label: isOpen ? 'Open now' : 'Closed',
  };
}

export function MarketHoursBadge({ openingHours }: MarketHoursBadgeProps) {
  const { isOpen, label } = parseHours(openingHours);

  return (
    <View style={[styles.badge, isOpen ? styles.open : styles.closed]}>
      <Text style={[styles.text, isOpen ? styles.openText : styles.closedText]}>
        {label}
      </Text>
    </View>
  );
}

export function formatOpeningHours(openingHours: Record<string, unknown>): string {
  const today = getTodayKey();
  const todayHours = openingHours[today] as
    | { open?: string; close?: string }
    | undefined;

  if (!todayHours?.open || !todayHours?.close) {
    return 'See market for hours';
  }

  return `Today ${todayHours.open} – ${todayHours.close}`;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  open: {
    backgroundColor: colors.green.light,
  },
  closed: {
    backgroundColor: colors.neutral[100],
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
  openText: {
    color: colors.green.primary,
  },
  closedText: {
    color: colors.neutral[600],
  },
});

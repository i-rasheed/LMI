import { StyleSheet, Text, View } from 'react-native';
import { formatBadgeLabel } from '../../utils/reporter';
import { colors, typography } from '../../theme';

interface ReporterBadgeProps {
  displayName: string;
  badgeLevel: string | null;
  isVerified?: boolean;
}

export function ReporterBadge({
  displayName,
  badgeLevel,
  isVerified = false,
}: ReporterBadgeProps) {
  const badgeLabel = formatBadgeLabel(badgeLevel);

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{displayName}</Text>
      {badgeLabel ? (
        <Text style={styles.badge}> · {badgeLabel}</Text>
      ) : null}
      {isVerified ? <Text style={styles.verified}> ✓</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  name: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  badge: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  verified: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
  },
});

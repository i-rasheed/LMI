import { StyleSheet, Text, View } from 'react-native';
import { FreshnessInfo } from '../../utils/freshness';
import { colors, radius, typography } from '../../theme';

interface FreshnessBadgeProps {
  freshness: FreshnessInfo;
}

const LEVEL_COLORS = {
  fresh: colors.green.primary,
  stale: colors.amber.warning,
  outdated: colors.red.error,
};

export function FreshnessBadge({ freshness }: FreshnessBadgeProps) {
  return (
    <View style={styles.row}>
      <View
        style={[styles.dot, { backgroundColor: LEVEL_COLORS[freshness.level] }]}
      />
      <Text style={[styles.label, { color: LEVEL_COLORS[freshness.level] }]}>
        {freshness.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});

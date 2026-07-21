import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PriceInsight } from '../../utils/price-insight';
import { colors, radius, spacing, typography } from '../../theme';

interface PriceInsightTeaserProps {
  insight: PriceInsight;
  onPress?: () => void;
}

const toneStyles: Record<
  PriceInsight['tone'],
  { background: string; border: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  higher: {
    background: '#FEF3C7',
    border: '#F59E0B',
    icon: 'trending-up',
    iconColor: colors.amber.warning,
  },
  lower: {
    background: colors.green.light,
    border: colors.green.primary,
    icon: 'trending-down',
    iconColor: colors.green.primary,
  },
  typical: {
    background: colors.neutral[0],
    border: colors.neutral[100],
    icon: 'analytics-outline',
    iconColor: colors.neutral[600],
  },
};

export function PriceInsightTeaser({ insight, onPress }: PriceInsightTeaserProps) {
  const tone = toneStyles[insight.tone];

  return (
    <Pressable style={[styles.container, { backgroundColor: tone.background, borderColor: tone.border }]} onPress={onPress}>
      <Ionicons name={tone.icon} size={20} color={tone.iconColor} />
      <Text style={styles.message}>{insight.message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.screenHorizontal,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  message: {
    ...typography.body,
    color: colors.neutral[900],
    flex: 1,
    fontWeight: '500',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ComparePriceItem } from '../../types/prices';
import { getFreshness } from '../../utils/freshness';
import { formatPriceUnit } from '../../utils/formatPrice';
import { colors, radius, spacing, typography } from '../../theme';
import { FreshnessBadge } from './FreshnessBadge';
import { ReporterBadge } from './ReporterBadge';

interface PriceRowProps {
  price: ComparePriceItem;
  onPress: () => void;
  onFlagPress?: () => void;
  onReporterPress?: () => void;
  showUnderReview?: boolean;
}

export function PriceRow({
  price,
  onPress,
  onFlagPress,
  onReporterPress,
  showUnderReview = false,
}: PriceRowProps) {
  const freshness = getFreshness(price.submittedAt);

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      onLongPress={onFlagPress}
      delayLongPress={350}
    >
      <View style={styles.header}>
        <Text style={styles.market} numberOfLines={1}>
          {price.marketName}
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.price}>
            {formatPriceUnit(price.priceNaira, price.unit)}
          </Text>
          {onFlagPress ? (
            <Pressable
              onPress={onFlagPress}
              hitSlop={8}
              accessibilityLabel="Report price"
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={colors.neutral[400]}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={styles.badges}>
        <FreshnessBadge freshness={freshness} />
        {showUnderReview ? (
          <Text style={styles.reviewBadge}>Under review</Text>
        ) : null}
      </View>
      <Pressable onPress={onReporterPress} disabled={!onReporterPress}>
        <ReporterBadge
          displayName={price.submitter.displayName}
          badgeLevel={price.submitter.badgeLevel}
          isVerified={price.submitter.isVerifiedReporter}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    marginHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  reviewBadge: {
    ...typography.caption,
    color: colors.amber.warning,
    fontWeight: '600',
  },
  market: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
    flex: 1,
  },
  price: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
});

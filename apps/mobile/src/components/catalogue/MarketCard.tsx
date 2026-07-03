import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { MarketListItem } from '../../types/catalogue';
import { colors, radius, spacing, typography } from '../../theme';

interface MarketCardProps {
  market: MarketListItem;
  onPress: () => void;
}

export function MarketCard({ market, onPress }: MarketCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.name} numberOfLines={2}>
        {market.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {market.area}
        {market.distanceKm != null ? ` · ${market.distanceKm} km` : ''}
      </Text>
    </Pressable>
  );
}

interface MarketCardRowProps {
  markets: MarketListItem[];
  onMarketPress: (market: MarketListItem) => void;
}

export function MarketCardRow({ markets, onMarketPress }: MarketCardRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          onPress={() => onMarketPress(market)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.md,
  },
  card: {
    width: 160,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  name: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
  },
});

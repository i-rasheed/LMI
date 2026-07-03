import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProductCategory } from '../../types/catalogue';
import { formatCategory } from './ProductChip';
import { colors, radius, spacing, typography } from '../../theme';

const CATEGORY_ICONS: Record<ProductCategory, string> = {
  vegetables: '🥬',
  grains: '🌾',
  protein: '🍗',
  spices: '🌶️',
  oils: '🫒',
  fruits: '🍊',
  other: '📦',
};

const CATEGORY_ORDER: ProductCategory[] = [
  'vegetables',
  'grains',
  'protein',
  'spices',
  'oils',
  'fruits',
  'other',
];

interface CategoryGridProps {
  counts?: Record<string, number>;
  onCategoryPress: (category: ProductCategory) => void;
}

export function CategoryGrid({ counts, onCategoryPress }: CategoryGridProps) {
  return (
    <View style={styles.grid}>
      {CATEGORY_ORDER.map((category) => (
        <Pressable
          key={category}
          style={styles.tile}
          onPress={() => onCategoryPress(category)}
        >
          <Text style={styles.icon}>{CATEGORY_ICONS[category]}</Text>
          <Text style={styles.label}>{formatCategory(category)}</Text>
          {counts?.[category] != null ? (
            <Text style={styles.count}>{counts[category]} items</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.md,
  },
  tile: {
    width: '47%',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  count: {
    ...typography.caption,
    color: colors.neutral[600],
  },
});

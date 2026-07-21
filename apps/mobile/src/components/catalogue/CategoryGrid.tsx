import { PRODUCT_CATEGORIES, ProductCategory, getProductCategoryLabel } from '@lmi/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface CategoryGridProps {
  counts?: Record<string, number>;
  selectedCategory?: ProductCategory | null;
  onCategoryPress: (category: ProductCategory) => void;
}

export function CategoryGrid({
  counts,
  selectedCategory,
  onCategoryPress,
}: CategoryGridProps) {
  return (
    <View style={styles.grid}>
      {PRODUCT_CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.value;

        return (
          <Pressable
            key={category.value}
            style={[styles.tile, isSelected && styles.tileSelected]}
            onPress={() => onCategoryPress(category.value)}
          >
          <Text style={styles.icon}>{category.icon}</Text>
          <Text style={styles.label}>{category.label}</Text>
          {counts?.[category.value] != null ? (
            <Text style={styles.count}>
              {counts[category.value]} item{counts[category.value] === 1 ? '' : 's'}
            </Text>
          ) : null}
        </Pressable>
        );
      })}
    </View>
  );
}

export { getProductCategoryLabel as formatCategory };

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
  tileSelected: {
    borderColor: colors.green.primary,
    backgroundColor: colors.green.light,
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

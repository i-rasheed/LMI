import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { getProductCategoryLabel } from '@lmi/shared';
import { ProductListItem } from '../../types/catalogue';
import { colors, radius, spacing, typography } from '../../theme';

interface ProductChipProps {
  product: ProductListItem;
  onPress: () => void;
}

export function ProductChip({ product, onPress }: ProductChipProps) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.category} numberOfLines={1}>
        {formatCategory(product.category)}
      </Text>
    </Pressable>
  );
}

interface ProductChipRowProps {
  products: ProductListItem[];
  onProductPress: (product: ProductListItem) => void;
}

export function ProductChipRow({ products, onProductPress }: ProductChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {products.map((product) => (
        <ProductChip
          key={product.id}
          product={product}
          onPress={() => onProductPress(product)}
        />
      ))}
    </ScrollView>
  );
}

export function formatCategory(category: string): string {
  return getProductCategoryLabel(category);
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.green.light,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.green.primary,
    maxWidth: 160,
  },
  name: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  category: {
    ...typography.caption,
    color: colors.neutral[600],
  },
});

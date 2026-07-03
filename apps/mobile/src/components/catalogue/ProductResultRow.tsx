import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProductListItem } from '../../types/catalogue';
import { formatCategory } from './ProductChip';
import { colors, radius, spacing, typography } from '../../theme';

interface ProductResultRowProps {
  product: ProductListItem;
  onPress: () => void;
}

export function ProductResultRow({ product, onPress }: ProductResultRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {product.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.meta}>{formatCategory(product.category)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.compact,
    backgroundColor: colors.green.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  chevron: {
    ...typography.h2,
    color: colors.neutral[400],
  },
});

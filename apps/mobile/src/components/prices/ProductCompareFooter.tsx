import { Ionicons } from '@expo/vector-icons';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompareResponse } from '../../types/prices';
import { formatPriceUnit } from '../../utils/formatPrice';
import { colors, spacing, typography } from '../../theme';

interface ProductCompareFooterProps {
  compare: CompareResponse | undefined;
  isFavourite?: boolean;
  hasAlert?: boolean;
  onToggleFavourite: () => void;
  onOpenAlert: () => void;
}

export function ProductCompareFooter({
  compare,
  isFavourite = false,
  hasAlert = false,
  onToggleFavourite,
  onOpenAlert,
}: ProductCompareFooterProps) {
  const insets = useSafeAreaInsets();

  const onShare = async () => {
    if (!compare?.product) {
      return;
    }

    const cheapestLine = compare.cheapest
      ? `Cheapest: ${formatPriceUnit(compare.cheapest.priceNaira, compare.cheapest.unit)} at ${compare.cheapest.marketName}`
      : 'Compare prices across Lagos markets';

    const message = [
      `${compare.product.name} in Lagos markets`,
      cheapestLine,
      `Compare prices: https://lmi.ng/p/${compare.product.slug}`,
      '— Lagos Market Intelligence',
    ].join('\n');

    await Share.share({ message });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}>
      <FooterButton
        icon={isFavourite ? 'heart' : 'heart-outline'}
        label={isFavourite ? 'Saved' : 'Save'}
        active={isFavourite}
        onPress={onToggleFavourite}
      />
      <FooterButton
        icon={hasAlert ? 'notifications' : 'notifications-outline'}
        label={hasAlert ? 'Alert on' : 'Alert'}
        active={hasAlert}
        onPress={onOpenAlert}
      />
      <FooterButton icon="share-outline" label="Share" onPress={() => void onShare()} />
    </View>
  );
}

function FooterButton({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Ionicons
        name={icon}
        size={22}
        color={active ? colors.green.primary : colors.neutral[600]}
      />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.screenHorizontal,
  },
  button: {
    alignItems: 'center',
    gap: 4,
    padding: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.neutral[900],
    fontWeight: '600',
  },
});

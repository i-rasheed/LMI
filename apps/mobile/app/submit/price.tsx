import { PriceUnit } from '@lmi/shared';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { SubmitStepHeader } from '../../src/components/submit/SubmitStepHeader';
import { fetchMarketAverage } from '../../src/services/prices.service';
import { useSubmitStore } from '../../src/stores/submitStore';
import { formatNaira, formatPriceUnit } from '../../src/utils/formatPrice';
import { colors, radius, spacing, typography } from '../../src/theme';

const UNITS: PriceUnit[] = ['kg', 'piece', 'bunch', 'litre', 'crate', 'bag'];

export default function SubmitPriceScreen() {
  const insets = useSafeAreaInsets();
  const marketId = useSubmitStore((state) => state.marketId);
  const marketName = useSubmitStore((state) => state.marketName);
  const productId = useSubmitStore((state) => state.productId);
  const productName = useSubmitStore((state) => state.productName);
  const storedPrice = useSubmitStore((state) => state.priceNaira);
  const storedUnit = useSubmitStore((state) => state.unit);
  const setPrice = useSubmitStore((state) => state.setPrice);

  const [priceText, setPriceText] = useState(
    storedPrice != null ? String(storedPrice) : '',
  );
  const [unit, setUnit] = useState<PriceUnit>(storedUnit ?? 'kg');
  const [averageNaira, setAverageNaira] = useState<number | null>(null);

  useEffect(() => {
    if (!productId || !marketId) {
      return;
    }

    void fetchMarketAverage({ productId, marketId, unit })
      .then((result) => setAverageNaira(result.averageNaira))
      .catch(() => setAverageNaira(null));
  }, [productId, marketId, unit]);

  const priceNaira = useMemo(() => {
    const parsed = Number.parseInt(priceText.replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }, [priceText]);

  const canContinue =
    priceNaira != null && priceNaira > 0 && priceNaira < 1_000_000;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SubmitStepHeader title="Price & unit" step={3} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          {productName} at {marketName}
        </Text>

        <View style={styles.priceField}>
          <Text style={styles.currency}>₦</Text>
          <TextInput
            style={styles.priceInput}
            value={priceText}
            onChangeText={setPriceText}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.neutral[400]}
            autoFocus
          />
        </View>

        <Text style={styles.label}>Unit</Text>
        <View style={styles.unitRow}>
          {UNITS.map((item) => (
            <Pressable
              key={item}
              style={[styles.unitChip, unit === item && styles.unitChipActive]}
              onPress={() => setUnit(item)}
            >
              <Text
                style={[
                  styles.unitChipText,
                  unit === item && styles.unitChipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {averageNaira != null ? (
          <View style={styles.referenceCard}>
            <Text style={styles.referenceText}>
              Current average at this market:{' '}
              {formatPriceUnit(averageNaira, unit)}
            </Text>
          </View>
        ) : null}

        {priceNaira != null && priceNaira > 0 ? (
          <Text style={styles.preview}>
            You are submitting {formatNaira(priceNaira)} per {unit}
          </Text>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => {
            if (!canContinue || priceNaira == null) {
              return;
            }
            setPrice(priceNaira, unit);
            router.push('/submit/confirm');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
  },
  priceField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    paddingHorizontal: spacing.lg,
    minHeight: 72,
    marginBottom: spacing.lg,
  },
  currency: {
    ...typography.h2,
    color: colors.neutral[900],
    marginRight: spacing.sm,
  },
  priceInput: {
    flex: 1,
    ...typography.h1,
    color: colors.neutral[900],
  },
  label: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  unitChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    backgroundColor: colors.neutral[0],
  },
  unitChipActive: {
    borderColor: colors.green.primary,
    backgroundColor: colors.green.light,
  },
  unitChipText: {
    ...typography.body,
    color: colors.neutral[600],
    textTransform: 'capitalize',
  },
  unitChipTextActive: {
    color: colors.green.primary,
    fontWeight: '600',
  },
  referenceCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    marginBottom: spacing.md,
  },
  referenceText: {
    ...typography.body,
    color: colors.neutral[600],
  },
  preview: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  footer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
    backgroundColor: colors.neutral[100],
  },
});

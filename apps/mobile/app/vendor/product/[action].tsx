import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vendorProductSchema, priceUnitSchema } from '@lmi/shared';
import { z } from 'zod';
import { FormField } from '../../../src/components/auth/FormField';
import { PrimaryButton } from '../../../src/components/auth/PrimaryButton';
import { queryKeys } from '../../../src/lib/query-keys';
import {
  addVendorProduct,
  fetchVendorProducts,
  updateVendorProduct,
} from '../../../src/services/vendors.service';
import { colors, radius, spacing, typography } from '../../../src/theme';

const formSchema = vendorProductSchema;
type VendorProductForm = z.infer<typeof formSchema>;

const UNITS = priceUnitSchema.options;

export default function VendorProductFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const [rootError, setRootError] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: queryKeys.vendor.products,
    queryFn: fetchVendorProducts,
    enabled: isEdit,
  });

  const existing = useMemo(
    () => productsQuery.data?.find((item) => item.id === id),
    [productsQuery.data, id],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorProductForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      priceNaira: 0,
      unit: 'kg',
      isAvailableToday: true,
      photoUrl: '',
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        priceNaira: existing.priceNaira,
        unit: existing.unit as VendorProductForm['unit'],
        isAvailableToday: existing.isAvailableToday,
        photoUrl: existing.photoUrl ?? '',
      });
    }
  }, [existing, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      if (isEdit && id) {
        await updateVendorProduct(id, {
          priceNaira: values.priceNaira,
          unit: values.unit,
          isAvailableToday: values.isAvailableToday,
          photoUrl: values.photoUrl,
        });
      } else {
        await addVendorProduct({
          productName: values.productName?.trim(),
          priceNaira: values.priceNaira,
          unit: values.unit,
          isAvailableToday: values.isAvailableToday,
          ...(values.photoUrl ? { photoUrl: values.photoUrl } : {}),
        });
      }
      router.replace('/(tabs)/vendor/products');
    } catch (error) {
      setRootError(
        error instanceof Error ? error.message : 'Could not save product',
      );
    }
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>{isEdit ? 'Edit product' : 'Add product'}</Text>

      {!isEdit ? (
        <Controller
          control={control}
          name="productName"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Product name"
              placeholder="e.g. Tomatoes, Smoked fish, Rice"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.productName?.message}
            />
          )}
        />
      ) : (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedLabel}>Product</Text>
          <Text style={styles.selectedName}>{existing?.productName}</Text>
        </View>
      )}

      <Controller
        control={control}
        name="priceNaira"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Price (₦)"
            keyboardType="number-pad"
            value={value ? String(value) : ''}
            onChangeText={(text) => onChange(Number(text.replace(/\D/g, '')) || 0)}
            onBlur={onBlur}
            error={errors.priceNaira?.message}
          />
        )}
      />

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Unit</Text>
        <View style={styles.chipRow}>
          {UNITS.map((unit) => (
            <Controller
              key={unit}
              control={control}
              name="unit"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  style={[styles.chip, value === unit && styles.chipActive]}
                  onPress={() => onChange(unit)}
                >
                  <Text
                    style={[styles.chipText, value === unit && styles.chipTextActive]}
                  >
                    {unit}
                  </Text>
                </Pressable>
              )}
            />
          ))}
        </View>
      </View>

      <Controller
        control={control}
        name="isAvailableToday"
        render={({ field: { value, onChange } }) => (
          <View style={styles.switchRow}>
            <Text style={styles.label}>Available today</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      {rootError ? <Text style={styles.error}>{rootError}</Text> : null}

      <PrimaryButton
        label={isEdit ? 'Save changes' : 'Publish product'}
        onPress={onSubmit}
        loading={isSubmitting}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  selectedCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  selectedLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  selectedName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  fieldBlock: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.neutral[900],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral[400],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[0],
  },
  chipActive: {
    backgroundColor: colors.green.primary,
    borderColor: colors.green.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  chipTextActive: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});

import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stallClaimSchema } from '@lmi/shared';
import { z } from 'zod';
import { FormField } from '../../../src/components/auth/FormField';
import { PrimaryButton } from '../../../src/components/auth/PrimaryButton';
import { useProductCategories } from '../../../src/hooks/useTrending';
import { queryKeys } from '../../../src/lib/query-keys';
import {
  fetchClaimStatus,
  resubmitStallClaim,
  submitStallClaim,
} from '../../../src/services/vendors.service';
import { uploadStallPhoto } from '../../../src/services/storage.service';
import { useAuthStore } from '../../../src/stores/authStore';
import { colors, radius, spacing, typography } from '../../../src/theme';

const formSchema = stallClaimSchema;
type StallClaimForm = z.infer<typeof formSchema>;

export default function VendorClaimStallScreen() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const { marketId, marketName, marketArea, resubmit } = useLocalSearchParams<{
    marketId?: string;
    marketName?: string;
    marketArea?: string;
    resubmit?: string;
  }>();
  const isResubmit = resubmit === '1';
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const claimStatusQuery = useQuery({
    queryKey: queryKeys.vendor.claimStatus,
    queryFn: fetchClaimStatus,
    enabled: isResubmit,
  });

  const categoriesQuery = useProductCategories();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StallClaimForm>({
    resolver: zodResolver(formSchema),
    values: useMemo(
      () => ({
        marketId: String(marketId ?? claimStatusQuery.data?.marketId ?? ''),
        stallName: claimStatusQuery.data?.stallName ?? '',
        categories: claimStatusQuery.data?.categories ?? [],
        description: claimStatusQuery.data?.description ?? '',
        locationHint: claimStatusQuery.data?.locationHint ?? '',
        photos: claimStatusQuery.data?.photos ?? [],
      }),
      [claimStatusQuery.data, marketId],
    ),
  });

  const selectedCategories = watch('categories');

  async function pickPhoto() {
    if (photoUrls.length >= 5) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setUploadingPhoto(true);
    try {
      const url = await uploadStallPhoto(result.assets[0].uri, userId);
      const nextPhotos = [...photoUrls, url];
      setPhotoUrls(nextPhotos);
      setValue('photos', nextPhotos, { shouldValidate: true });
    } catch (error) {
      setRootError(
        error instanceof Error ? error.message : 'Could not upload photo',
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      if (isResubmit) {
        await resubmitStallClaim(values);
      } else {
        await submitStallClaim(values);
      }
      router.replace('/(tabs)/vendor');
    } catch (error) {
      setRootError(
        error instanceof Error ? error.message : 'Could not submit claim',
      );
    }
  });

  function toggleCategory(category: string) {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];
    setValue('categories', next, { shouldValidate: true });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>Stall details</Text>
      <Text style={styles.subtitle}>
        {marketName ?? claimStatusQuery.data?.marketName}
        {marketArea || claimStatusQuery.data?.marketArea
          ? ` · ${marketArea ?? claimStatusQuery.data?.marketArea}`
          : ''}
      </Text>

      <Controller
        control={control}
        name="stallName"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Stall name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.stallName?.message}
          />
        )}
      />

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Product categories</Text>
        {categoriesQuery.isLoading ? (
          <View style={styles.categoriesState}>
            <ActivityIndicator color={colors.green.primary} />
            <Text style={styles.categoriesStateText}>Loading categories…</Text>
          </View>
        ) : categoriesQuery.isError ? (
          <View style={styles.categoriesState}>
            <Text style={styles.error}>Could not load categories.</Text>
            <Pressable onPress={() => void categoriesQuery.refetch()}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        ) : (categoriesQuery.data ?? []).length === 0 ? (
          <Text style={styles.categoriesStateText}>
            No categories available yet.
          </Text>
        ) : (
          <View style={styles.chipRow}>
            {(categoriesQuery.data ?? []).map((item) => {
              const active = selectedCategories.includes(item.category);
              return (
                <Pressable
                  key={item.category}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleCategory(item.category)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.category}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {errors.categories?.message ? (
          <Text style={styles.error}>{errors.categories.message}</Text>
        ) : null}
      </View>

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Description"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            error={errors.description?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="locationHint"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Stall location"
            placeholder="Row B, Stall 14"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.locationHint?.message}
          />
        )}
      />

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Stall photos (optional)</Text>
        <Pressable style={styles.photoButton} onPress={pickPhoto}>
          {uploadingPhoto ? (
            <ActivityIndicator color={colors.green.primary} />
          ) : (
            <Text style={styles.photoButtonText}>
              Add photo ({photoUrls.length}/5)
            </Text>
          )}
        </Pressable>
      </View>

      {rootError ? <Text style={styles.error}>{rootError}</Text> : null}

      <PrimaryButton
        label={isResubmit ? 'Resubmit claim' : 'Submit claim'}
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
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
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
  categoriesState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoriesStateText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  retryText: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '600',
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
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  photoButton: {
    minHeight: 48,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
  },
  photoButtonText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});

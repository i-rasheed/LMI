import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../src/components/auth/PrimaryButton';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../../src/lib/query-keys';
import { applyFlagAction, fetchFlagReview } from '../../../src/services/admin.service';
import { formatBadgeLabel } from '../../../src/utils/reporter';
import { formatPriceUnit } from '../../../src/utils/formatPrice';
import { colors, radius, spacing, typography } from '../../../src/theme';

const REASON_LABELS: Record<string, string> = {
  incorrect_price: 'Incorrect price',
  outdated: 'Outdated',
  spam: 'Spam',
};

export default function AdminFlagReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [editPrice, setEditPrice] = useState('');

  const reviewQuery = useQuery({
    queryKey: queryKeys.admin.flagDetail(id ?? ''),
    queryFn: () => fetchFlagReview(id!),
    enabled: Boolean(id),
  });

  const actionMutation = useMutation({
    mutationFn: (action: Parameters<typeof applyFlagAction>[1]) =>
      applyFlagAction(id!, action),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.flags() });
      router.back();
    },
  });

  const review = reviewQuery.data;

  function confirmAction(
    title: string,
    message: string,
    action: Parameters<typeof applyFlagAction>[1],
  ) {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: () => actionMutation.mutate(action),
      },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Queue</Text>
        </Pressable>
        <Text style={styles.title}>Flag review</Text>
      </View>

      {reviewQuery.isLoading ? (
        <View style={styles.loading}>
          <SkeletonBox height={120} />
          <SkeletonBox height={80} />
        </View>
      ) : reviewQuery.isError || !review ? (
        <ErrorState onRetry={() => void reviewQuery.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Submission</Text>
            <Text style={styles.product}>{review.submission.productName}</Text>
            <Text style={styles.meta}>{review.submission.marketName}</Text>
            <Text style={styles.price}>
              {formatPriceUnit(
                review.submission.priceNaira,
                review.submission.unit,
              )}
            </Text>
            {review.submission.photoUrl ? (
              <Image
                source={{ uri: review.submission.photoUrl }}
                style={styles.photo}
              />
            ) : null}
            {review.marketAverageNaira != null ? (
              <Text style={styles.meta}>
                7-day average:{' '}
                {formatPriceUnit(
                  review.marketAverageNaira,
                  review.submission.unit,
                )}
              </Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Reporter</Text>
            <Text style={styles.meta}>{review.reporter.displayName}</Text>
            <Text style={styles.meta}>
              {formatBadgeLabel(review.reporter.badgeLevel) ?? 'Reporter'} ·{' '}
              {review.reporter.acceptedSubmissionCount} submissions
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Flags ({review.flagCount})
            </Text>
            {Object.entries(review.reasonBreakdown).map(([reason, count]) => (
              <Text key={reason} style={styles.meta}>
                {REASON_LABELS[reason] ?? reason}: {count}
              </Text>
            ))}
            {review.flags
              .filter((flag) => flag.comment)
              .map((flag) => (
                <Text key={flag.id} style={styles.comment}>
                  “{flag.comment}”
                </Text>
              ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Edit price</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder={String(review.submission.priceNaira)}
              placeholderTextColor={colors.neutral[400]}
              value={editPrice}
              onChangeText={setEditPrice}
            />
            <PrimaryButton
              label="Save edited price"
              loading={actionMutation.isPending}
              disabled={!editPrice.trim()}
              onPress={() => {
                const priceNaira = Number.parseInt(editPrice, 10);
                if (!Number.isFinite(priceNaira) || priceNaira <= 0) {
                  return;
                }
                actionMutation.mutate({ action: 'edit', priceNaira });
              }}
            />
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Confirm — keep live"
              loading={actionMutation.isPending}
              onPress={() => actionMutation.mutate({ action: 'confirm' })}
            />
            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                confirmAction(
                  'Remove price',
                  'This will delist the price from comparison.',
                  { action: 'remove' },
                )
              }
            >
              <Text style={styles.secondaryText}>Remove</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                confirmAction(
                  'Warn reporter',
                  'Reporter will see a warning on next app open.',
                  { action: 'warn' },
                )
              }
            >
              <Text style={styles.secondaryText}>Warn reporter</Text>
            </Pressable>
            <Pressable
              style={styles.dangerButton}
              onPress={() =>
                confirmAction(
                  'Ban reporter',
                  'This suspends the reporter account and removes the price.',
                  { action: 'ban' },
                )
              }
            >
              <Text style={styles.dangerText}>Ban reporter</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  back: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  loading: {
    padding: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  product: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  price: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  meta: {
    ...typography.body,
    color: colors.neutral[600],
  },
  comment: {
    ...typography.caption,
    color: colors.neutral[900],
    fontStyle: 'italic',
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: radius.compact,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.compact,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    ...typography.body,
    color: colors.neutral[900],
  },
  actions: {
    gap: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.neutral[100],
    borderRadius: radius.button,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
  },
  secondaryText: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  dangerButton: {
    borderRadius: radius.button,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  dangerText: {
    ...typography.body,
    color: colors.red.error,
    fontWeight: '600',
  },
});

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormField } from '../../../src/components/auth/FormField';
import { PrimaryButton } from '../../../src/components/auth/PrimaryButton';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../../src/lib/query-keys';
import {
  applyClaimAction,
  fetchClaimReview,
} from '../../../src/services/admin.service';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function AdminClaimReviewScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const claimId = String(id ?? '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reviewQuery = useQuery({
    queryKey: queryKeys.admin.claimDetail(claimId),
    queryFn: () => fetchClaimReview(claimId),
    enabled: Boolean(claimId),
  });

  const actionMutation = useMutation({
    mutationFn: (action: { action: 'approve' } | { action: 'reject'; rejectionReason: string }) =>
      applyClaimAction(claimId, action),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.claims });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      router.back();
    },
    onError: (nextError) => {
      setError(
        nextError instanceof Error ? nextError.message : 'Action failed',
      );
    },
  });

  const claim = reviewQuery.data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>Review claim</Text>

      {reviewQuery.isLoading ? (
        <SkeletonBox height={180} />
      ) : reviewQuery.isError || !claim ? (
        <ErrorState onRetry={() => void reviewQuery.refetch()} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.stallName}>{claim.stallName}</Text>
            <Text style={styles.meta}>
              {claim.marketName} · {claim.marketArea}
            </Text>
            <Text style={styles.meta}>
              Vendor: {claim.ownerDisplayName ?? claim.ownerId}
            </Text>
            <Text style={styles.body}>{claim.description}</Text>
            <Text style={styles.meta}>Location: {claim.locationHint}</Text>
            <Text style={styles.meta}>
              Categories: {claim.categories.join(', ')}
            </Text>
          </View>

          <PrimaryButton
            label="Approve claim"
            onPress={() => actionMutation.mutate({ action: 'approve' })}
            loading={actionMutation.isPending}
          />

          <FormField
            label="Rejection reason"
            value={rejectionReason}
            onChangeText={setRejectionReason}
            multiline
          />
          <PrimaryButton
            label="Reject claim"
            onPress={() =>
              actionMutation.mutate({
                action: 'reject',
                rejectionReason,
              })
            }
            loading={actionMutation.isPending}
            disabled={rejectionReason.trim().length < 5}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      )}
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
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.sm,
  },
  stallName: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  body: {
    ...typography.body,
    color: colors.neutral[900],
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});

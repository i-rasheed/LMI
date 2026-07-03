import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../src/components/auth/PrimaryButton';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../../src/lib/query-keys';
import { fetchClaimStatus } from '../../../src/services/vendors.service';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function VendorClaimStatusScreen() {
  const insets = useSafeAreaInsets();

  const claimQuery = useQuery({
    queryKey: queryKeys.vendor.claimStatus,
    queryFn: fetchClaimStatus,
  });

  const claim = claimQuery.data;

  if (claimQuery.isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <SkeletonBox height={180} />
      </View>
    );
  }

  if (claimQuery.isError || !claim?.hasClaim) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ErrorState
          headline="No stall found"
          message="Start by selecting your market."
          onRetry={() => router.replace('/vendor/claim/market')}
        />
      </View>
    );
  }

  if (claim.claimStatus === 'rejected') {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.icon}>✕</Text>
          <Text style={styles.title}>Stall setup needs changes</Text>
          <Text style={styles.body}>
            {claim.rejectionReason ??
              'Please update your stall details and submit again.'}
          </Text>
        </View>
        <PrimaryButton
          label="Edit stall details"
          onPress={() =>
            router.push({
              pathname: '/vendor/claim/stall',
              params: { resubmit: '1' },
            })
          }
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.title}>Your stall is live</Text>
        <Text style={styles.body}>
          Start adding products from your vendor dashboard.
        </Text>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Stall</Text>
          <Text style={styles.metaValue}>{claim.stallName}</Text>
          <Text style={styles.metaLabel}>Market</Text>
          <Text style={styles.metaValue}>
            {claim.marketName} · {claim.marketArea}
          </Text>
        </View>
      </View>

      <PrimaryButton
        label="Go to dashboard"
        onPress={() => router.replace('/(tabs)/vendor')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.md,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
    textAlign: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  metaBlock: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.neutral[400],
    textTransform: 'uppercase',
  },
  metaValue: {
    ...typography.body,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
});

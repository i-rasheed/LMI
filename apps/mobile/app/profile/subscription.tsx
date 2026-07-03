import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchSubscriptionStatus } from '../../src/services/subscriptions.service';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function ProfileSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const subscriptionQuery = useQuery({
    queryKey: queryKeys.subscriptions.me,
    queryFn: fetchSubscriptionStatus,
  });

  const subscription = subscriptionQuery.data?.subscription;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Subscription</Text>

      {subscriptionQuery.isLoading ? (
        <SkeletonBox height={140} />
      ) : subscriptionQuery.isError ? (
        <ErrorState onRetry={() => void subscriptionQuery.refetch()} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.status}>
            {subscriptionQuery.data?.isPremium ? 'LMI Premium' : 'Free plan'}
          </Text>
          <Text style={styles.body}>
            {subscriptionQuery.data?.isPremium
              ? `Active${subscription?.currentPeriodEnd ? ` until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : ''}`
              : 'Upgrade to unlock price history, unlimited alerts, favourites, and shopping list items.'}
          </Text>
          {subscription?.cancelAtPeriodEnd ? (
            <Text style={styles.warning}>Cancels at period end</Text>
          ) : null}
        </View>
      )}

      <PrimaryButton
        label={subscriptionQuery.data?.isPremium ? 'Manage Premium' : 'Upgrade to Premium'}
        onPress={() => router.push('/premium/upgrade')}
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
  back: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  status: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  body: {
    ...typography.body,
    color: colors.neutral[600],
  },
  warning: {
    ...typography.caption,
    color: colors.amber.warning,
    fontWeight: '700',
  },
});

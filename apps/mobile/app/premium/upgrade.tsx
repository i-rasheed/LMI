import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchMe } from '../../src/services/auth.service';
import { syncProfileToStore } from '../../src/services/profile-sync';
import {
  fetchSubscriptionPlans,
  fetchSubscriptionStatus,
  initializeSubscription,
} from '../../src/services/subscriptions.service';
import { SubscriptionPlan } from '../../src/types/subscriptions';
import { colors, radius, spacing, typography } from '../../src/theme';

const CALLBACK_URL =
  process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL ??
  'https://lmi.ng/paystack/success';

export default function PremiumUpgradeScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: queryKeys.subscriptions.plans,
    queryFn: fetchSubscriptionPlans,
  });

  const initializeMutation = useMutation({
    mutationFn: (planId: string) =>
      initializeSubscription({ planId, callbackUrl: CALLBACK_URL }),
    onSuccess: (session) => {
      setCheckoutUrl(session.authorizationUrl);
    },
    onError: (error) => {
      setMessage(
        error instanceof Error
          ? error.message
          : "Payment didn't go through. Please try again or use bank transfer.",
      );
    },
  });

  async function refreshSubscription() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.me });
    await fetchSubscriptionStatus();
    const profile = await fetchMe();
    syncProfileToStore(profile);
  }

  async function handleCheckoutUrl(url: string) {
    if (!url.startsWith(CALLBACK_URL)) {
      return;
    }

    setCheckoutUrl(null);
    setMessage('Payment received. Refreshing your Premium access...');
    try {
      await refreshSubscription();
      setMessage('Premium is active. Enjoy your unlocked features.');
      setTimeout(() => router.back(), 1000);
    } catch {
      setMessage(
        'Payment complete. Premium will appear after Paystack confirms the webhook.',
      );
    }
  }

  if (checkoutUrl) {
    return (
      <View style={[styles.webviewContainer, { paddingTop: insets.top }]}>
        <Pressable style={styles.closeButton} onPress={() => setCheckoutUrl(null)}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
        <WebView
          source={{ uri: checkoutUrl }}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator color={colors.green.primary} style={styles.loader} />
          )}
          onNavigationStateChange={(event) => void handleCheckoutUrl(event.url)}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>Save more with LMI Premium</Text>
      <Text style={styles.subtitle}>
        Unlock price history, unlimited favourites, alerts, and shopping list items.
      </Text>

      <View style={styles.featureCard}>
        {[
          'Unlimited saved products',
          'Unlimited active price alerts',
          'Unlimited shopping list items',
          'Price history charts',
          'Optimiser savings breakdowns',
        ].map((feature) => (
          <Text key={feature} style={styles.feature}>
            ✓ {feature}
          </Text>
        ))}
      </View>

      {plansQuery.isLoading ? (
        <SkeletonBox height={160} />
      ) : plansQuery.isError ? (
        <ErrorState onRetry={() => void plansQuery.refetch()} />
      ) : (
        <View style={styles.planList}>
          {(plansQuery.data ?? []).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              onPress={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </View>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <PrimaryButton
        label="Subscribe with Paystack"
        disabled={!selectedPlanId}
        loading={initializeMutation.isPending}
        onPress={() => selectedPlanId && initializeMutation.mutate(selectedPlanId)}
      />
      <Text style={styles.trust}>Secured by Paystack</Text>
    </ScrollView>
  );
}

function PlanCard({
  plan,
  selected,
  onPress,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onPress: () => void;
}) {
  const isAnnual = plan.billingInterval === 'annual';
  return (
    <Pressable
      style={[styles.planCard, selected && styles.planCardSelected]}
      onPress={onPress}
    >
      <View>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planMeta}>
          ₦{plan.amountNaira.toLocaleString()} /{' '}
          {isAnnual ? 'year' : 'month'}
        </Text>
      </View>
      {isAnnual ? <Text style={styles.saveBadge}>Save 33%</Text> : null}
    </Pressable>
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
  featureCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  feature: {
    ...typography.body,
    color: colors.neutral[900],
  },
  planList: {
    gap: spacing.md,
  },
  planCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  planCardSelected: {
    borderColor: colors.green.primary,
    backgroundColor: colors.green.light,
  },
  planName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  planMeta: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  saveBadge: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
  },
  message: {
    ...typography.caption,
    color: colors.green.dark,
  },
  trust: {
    ...typography.caption,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  closeButton: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },
  closeText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  loader: {
    marginTop: spacing.xl,
  },
});

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
import {
  fetchVendorSubscriptionPlans,
  initializeVendorSubscription,
} from '../../src/services/vendors.service';
import { SubscriptionPlan } from '../../src/types/subscriptions';
import { colors, radius, spacing, typography } from '../../src/theme';

const CALLBACK_URL =
  process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL ??
  'https://lmi.ng/paystack/success';

export default function VendorSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: queryKeys.vendor.plans,
    queryFn: fetchVendorSubscriptionPlans,
  });

  const initializeMutation = useMutation({
    mutationFn: (planId: string) =>
      initializeVendorSubscription({ planId, callbackUrl: CALLBACK_URL }),
    onSuccess: (session) => setCheckoutUrl(session.authorizationUrl),
    onError: (error) => {
      setMessage(
        error instanceof Error
          ? error.message
          : "Payment didn't go through. Please try again or use bank transfer.",
      );
    },
  });

  async function handleCheckoutUrl(url: string) {
    if (!url.startsWith(CALLBACK_URL)) {
      return;
    }

    setCheckoutUrl(null);
    setMessage('Payment received. Refreshing your vendor tier...');
    await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard });
    await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.analytics });
    setTimeout(() => router.back(), 1000);
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
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Vendor subscription</Text>
      <Text style={styles.subtitle}>
        Upgrade to Pro for promoted placement and analytics.
      </Text>

      {plansQuery.isLoading ? (
        <SkeletonBox height={160} />
      ) : plansQuery.isError ? (
        <ErrorState onRetry={() => void plansQuery.refetch()} />
      ) : (
        <View style={styles.planList}>
          {(plansQuery.data ?? []).map((plan) => (
            <VendorPlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              onPress={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </View>
      )}

      <View style={styles.featureCard}>
        <Text style={styles.feature}>✓ Stall claim + listings</Text>
        <Text style={styles.feature}>✓ Public vendor profile</Text>
        <Text style={styles.feature}>✓ Pro: promoted shopper placement</Text>
        <Text style={styles.feature}>✓ Pro: analytics dashboard</Text>
      </View>

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

function VendorPlanCard({
  plan,
  selected,
  onPress,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onPress: () => void;
}) {
  const isPro = plan.planType === 'vendor_pro';

  return (
    <Pressable
      style={[styles.planCard, selected && styles.planCardSelected]}
      onPress={onPress}
    >
      <View style={styles.planText}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planMeta}>
          ₦{plan.amountNaira.toLocaleString()} / month
        </Text>
      </View>
      {isPro ? <Text style={styles.proBadge}>Pro</Text> : null}
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
  back: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
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
  planText: {
    flex: 1,
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
  proBadge: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
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

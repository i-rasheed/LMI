import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getPostAuthRoute } from '../../hooks/useAuthRedirect';
import { completeOnboarding } from '../../services/auth.service';
import { syncProfileToStore } from '../../services/profile-sync';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
import { LogoutButton } from './LogoutButton';
import { PrimaryButton } from './PrimaryButton';

interface OnboardingStepProps {
  step: 1 | 2 | 3;
  headline: string;
  body: string;
  nextHref?: '/(auth)/onboarding/step-2' | '/(auth)/onboarding/step-3';
  isFinal?: boolean;
}

function OnboardingStep({
  step,
  headline,
  body,
  nextHref,
  isFinal = false,
}: OnboardingStepProps) {
  const role = useAuthStore((state) => state.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    setLoading(true);
    setError(null);

    try {
      const profile = await completeOnboarding();
      syncProfileToStore(profile);
      router.replace(getPostAuthRoute(profile));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not finish onboarding');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 1) {
      router.replace('/(auth)/role-select');
      return;
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={goBack}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.skip}
            onPress={() => (isFinal ? void finish() : nextHref && router.push(nextHref))}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <LogoutButton />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.step}>Step {step} of 3</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.body}>{body}</Text>
        {role ? (
          <Text style={styles.roleHint}>Continuing as {role}</Text>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isFinal ? (
        <PrimaryButton label="Get started" onPress={finish} loading={loading} />
      ) : (
        <PrimaryButton
          label="Continue"
          onPress={() => nextHref && router.push(nextHref)}
        />
      )}
    </View>
  );
}

export function OnboardingStep1() {
  return (
    <OnboardingStep
      step={1}
      headline="See prices across Lagos"
      body="Compare tomatoes, rice, and pepper from Mile 12 to Balogun — without leaving home"
      nextHref="/(auth)/onboarding/step-2"
    />
  );
}

export function OnboardingStep2Shopper() {
  return (
    <OnboardingStep
      step={2}
      headline="Save every week"
      body="Build a shopping list and find the one market that saves you the most"
      nextHref="/(auth)/onboarding/step-3"
    />
  );
}

export function OnboardingStep2Reporter() {
  return (
    <OnboardingStep
      step={2}
      headline="Help your community"
      body="Share prices you see today and build trust with shoppers across Lagos"
      nextHref="/(auth)/onboarding/step-3"
    />
  );
}

export function OnboardingStep2Vendor() {
  return (
    <OnboardingStep
      step={2}
      headline="Grow your stall"
      body="Reach price-conscious shoppers planning their market run before they arrive"
      nextHref="/(auth)/onboarding/step-3"
    />
  );
}

export function OnboardingStep3() {
  return (
    <OnboardingStep
      step={3}
      headline="Prices you can trust"
      body="Every price shows who reported it and when it was last updated"
      isFinal
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing['2xl'],
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  skip: {
    alignSelf: 'flex-end',
  },
  skipText: {
    ...typography.body,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  step: {
    ...typography.label,
    color: colors.green.primary,
  },
  headline: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  body: {
    ...typography.body,
    color: colors.neutral[600],
  },
  roleHint: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});

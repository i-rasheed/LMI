import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GoogleOAuthButton } from '../../src/components/auth/GoogleOAuthButton';
import {
  OAuthCancelledError,
  getGooglePostAuthRoute,
  signInWithGoogle,
} from '../../src/services/oauth.service';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function WelcomeScreen() {
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setIsOAuthLoading(true);
    setError(null);
    try {
      const profile = await signInWithGoogle();
      router.replace(getGooglePostAuthRoute(profile));
    } catch (nextError) {
      if (!(nextError instanceof OAuthCancelledError)) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : 'Google sign-in failed. Try again.',
        );
      }
    } finally {
      setIsOAuthLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>LMI</Text>
        <Text style={styles.headline}>Know market prices before you go</Text>
        <Text style={styles.subhead}>
          Compare prices across Lagos markets in seconds
        </Text>
      </View>

      <View style={styles.actions}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create account</Text>
          </Pressable>
        </Link>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sign in</Text>
          </Pressable>
        </Link>
        <GoogleOAuthButton
          onPress={handleGoogleSignIn}
          loading={isOAuthLoading}
        />
      </View>
    </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    ...typography.display,
    color: colors.green.primary,
    marginBottom: spacing.lg,
  },
  headline: {
    ...typography.h1,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  subhead: {
    ...typography.body,
    color: colors.neutral[600],
  },
  actions: {
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.green.primary,
    borderRadius: radius.button,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.green.primary,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
});

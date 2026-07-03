import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { loginSchema, phoneNumberSchema } from '@lmi/shared';
import { AuthScreenLayout } from '../../src/components/auth/AuthScreenLayout';
import { FormField } from '../../src/components/auth/FormField';
import { GoogleOAuthButton } from '../../src/components/auth/GoogleOAuthButton';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { getPostAuthRoute } from '../../src/hooks/useAuthRedirect';
import { supabase } from '../../src/lib/supabase';
import { fetchMe } from '../../src/services/auth.service';
import {
  OAuthCancelledError,
  getGooglePostAuthRoute,
  signInWithGoogle,
} from '../../src/services/oauth.service';
import { syncProfileToStore } from '../../src/services/profile-sync';
import { colors, typography } from '../../src/theme';
import { normalizeNigerianPhone } from '../../src/utils/phone';

type LoginForm = {
  identifier: string;
  password?: string;
};

export default function LoginScreen() {
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const identifier = watch('identifier');
  const isPhone = phoneNumberSchema.safeParse(identifier).success;

  const onSubmit = handleSubmit(async (values) => {
    if (phoneNumberSchema.safeParse(values.identifier).success) {
      const phone = normalizeNigerianPhone(values.identifier);
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setError('root', { message: error.message });
        return;
      }

      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone, flow: 'login' },
      });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.identifier,
      password: values.password ?? '',
    });

    if (error) {
      setError('root', { message: error.message });
      return;
    }

    try {
      const profile = await fetchMe();
      syncProfileToStore(profile);
      router.replace(getPostAuthRoute(profile));
    } catch {
      setError('root', { message: 'Could not load your profile. Try again.' });
    }
  });

  async function handleGoogleSignIn() {
    setIsOAuthLoading(true);
    try {
      const profile = await signInWithGoogle();
      router.replace(getGooglePostAuthRoute(profile));
    } catch (error) {
      if (!(error instanceof OAuthCancelledError)) {
        setError('root', {
          message:
            error instanceof Error
              ? error.message
              : 'Google sign-in failed. Try again.',
        });
      }
    } finally {
      setIsOAuthLoading(false);
    }
  }

  return (
    <AuthScreenLayout title="Welcome back">
      <Controller
        control={control}
        name="identifier"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Phone or email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="username"
            placeholder="+234 801 234 5678 or you@example.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.identifier?.message}
          />
        )}
      />
      {!isPhone ? (
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Password"
              secureTextEntry
              autoComplete="password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />
      ) : (
        <Text style={styles.helper}>
          We'll text you a 6-digit code. No password needed.
        </Text>
      )}
      {errors.root?.message ? (
        <Text style={styles.error}>{errors.root.message}</Text>
      ) : null}
      <PrimaryButton label="Sign in" onPress={onSubmit} loading={isSubmitting} />
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>
      <GoogleOAuthButton
        onPress={handleGoogleSignIn}
        loading={isOAuthLoading}
        disabled={isSubmitting}
      />
      {!isPhone ? (
        <Link href="/(auth)/forgot-password" asChild>
          <Pressable>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </Link>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.footerText}>New to LMI?</Text>
        <Link href="/(auth)/register" asChild>
          <Pressable>
            <Text style={styles.link}>Create account</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
  link: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  helper: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[100],
  },
  dividerText: {
    ...typography.caption,
    color: colors.neutral[600],
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    ...typography.body,
    color: colors.neutral[600],
  },
});

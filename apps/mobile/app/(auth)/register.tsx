import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { registerEmailSchema, registerPhoneSchema } from '@lmi/shared';
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

const registerFormSchema = z
  .object({
    method: z.enum(['phone', 'email']),
    displayName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    isOver16: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.isOver16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must be 16 or older to use LMI',
        path: ['isOver16'],
      });
    }

    if (data.method === 'phone') {
      const result = registerPhoneSchema.safeParse({
        method: 'phone',
        displayName: data.displayName ?? '',
        phone: data.phone ?? '',
        isOver16: true,
      });
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: issue.path.filter(
              (part) => part !== 'method' && part !== 'isOver16',
            ),
          });
        }
      }
      return;
    }

    const result = registerEmailSchema.safeParse({
      method: 'email',
      displayName: data.displayName ?? '',
      email: data.email ?? '',
      password: data.password ?? '',
      isOver16: true,
    });
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issue.path.filter((part) => part !== 'method' && part !== 'isOver16'),
        });
      }
    }
  });

type RegisterForm = z.infer<typeof registerFormSchema>;

export default function RegisterScreen() {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      method: 'phone',
      displayName: '',
      phone: '',
      email: '',
      password: '',
      isOver16: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const displayName = values.displayName?.trim() ?? '';

    if (values.method === 'phone') {
      const phone = normalizeNigerianPhone(values.phone ?? '');
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true,
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        setError('root', { message: error.message });
        return;
      }

      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone, flow: 'register', displayName },
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email ?? '',
      password: values.password ?? '',
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      setError('root', { message: error.message });
      return;
    }

    if (!data.session) {
      setError('root', {
        message: 'Check your email to confirm your account, then sign in.',
      });
      return;
    }

    try {
      const profile = await fetchMe(data.session?.access_token);
      syncProfileToStore(profile);
      router.replace(getPostAuthRoute(profile));
    } catch {
      router.replace('/(auth)/role-select');
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
    <AuthScreenLayout title="Create your account">
      <Controller
        control={control}
        name="method"
        render={() => (
          <View style={styles.switcher}>
            {(['phone', 'email'] as const).map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.switcherOption,
                  method === item && styles.switcherOptionActive,
                ]}
                onPress={() => {
                  setMethod(item);
                  setValue('method', item, { shouldValidate: true });
                }}
              >
                <Text
                  style={[
                    styles.switcherText,
                    method === item && styles.switcherTextActive,
                  ]}
                >
                  {item === 'phone' ? 'Phone' : 'Email'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Full name"
            autoCapitalize="words"
            autoComplete="name"
            placeholder="e.g. Amaka Okafor"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.displayName?.message}
          />
        )}
      />
      {method === 'phone' ? (
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Phone number"
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="+234 801 234 5678"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
            />
          )}
        />
      ) : (
        <>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Password"
                secureTextEntry
                autoComplete="new-password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />
        </>
      )}
      <Controller
        control={control}
        name="isOver16"
        render={({ field: { value, onChange } }) => (
          <Pressable
            style={styles.checkboxRow}
            onPress={() => onChange(!value)}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.checkboxLabel}>I am 16 or older</Text>
          </Pressable>
        )}
      />
      {errors.isOver16?.message ? (
        <Text style={styles.error}>{errors.isOver16.message}</Text>
      ) : null}
      {errors.root?.message ? (
        <Text style={styles.error}>{errors.root.message}</Text>
      ) : null}
      <PrimaryButton label="Continue" onPress={onSubmit} loading={isSubmitting} />
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
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
  },
  checkboxChecked: {
    backgroundColor: colors.green.primary,
    borderColor: colors.green.primary,
  },
  checkmark: {
    color: colors.neutral[0],
    fontWeight: '700',
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.neutral[900],
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
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
  switcher: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    padding: 4,
  },
  switcherOption: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switcherOptionActive: {
    backgroundColor: colors.green.primary,
  },
  switcherText: {
    ...typography.body,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  switcherTextActive: {
    color: colors.neutral[0],
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
  link: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
});

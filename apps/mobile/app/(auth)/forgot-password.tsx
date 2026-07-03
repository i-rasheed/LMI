import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';
import { forgotPasswordSchema, ForgotPasswordInput } from '@lmi/shared';
import { AuthScreenLayout } from '../../src/components/auth/AuthScreenLayout';
import { FormField } from '../../src/components/auth/FormField';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { requestPasswordReset } from '../../src/services/auth.service';
import { colors, typography } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Request failed',
      });
    }
  });

  if (sent) {
    return (
      <AuthScreenLayout
        title="Check your email"
        subtitle="We sent a password reset link if an account exists for that address."
      >
        <PrimaryButton label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Reset password"
      subtitle="Enter the email on your account and we'll send a reset link."
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />
      {errors.root?.message ? (
        <Text style={styles.error}>{errors.root.message}</Text>
      ) : null}
      <PrimaryButton label="Send reset link" onPress={onSubmit} loading={isSubmitting} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});

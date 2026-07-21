import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { verifyOtpSchema } from '@lmi/shared';
import { AuthScreenLayout } from '../../src/components/auth/AuthScreenLayout';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { getPostAuthRoute } from '../../src/hooks/useAuthRedirect';
import { supabase } from '../../src/lib/supabase';
import { fetchMe, updateProfile } from '../../src/services/auth.service';
import { syncProfileToStore } from '../../src/services/profile-sync';
import { colors, radius, spacing, typography } from '../../src/theme';
import { maskPhone } from '../../src/utils/phone';

export default function VerifyOtpScreen() {
  const { phone, flow, displayName } = useLocalSearchParams<{
    phone?: string;
    flow?: 'register' | 'login';
    displayName?: string;
  }>();
  const phoneValue = useMemo(() => String(phone ?? ''), [phone]);
  const displayNameValue = useMemo(
    () => String(displayName ?? '').trim(),
    [displayName],
  );
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const submittedTokenRef = useRef<string | null>(null);

  const token = digits.join('');

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (token.length === 6 && token !== submittedTokenRef.current) {
      submittedTokenRef.current = token;
      void verifyToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function verifyToken(nextToken = token) {
    if (attemptsRemaining <= 0) {
      setError('Too many incorrect attempts. Please resend a new code.');
      return;
    }

    const parsed = verifyOtpSchema.safeParse({
      phone: phoneValue,
      token: nextToken,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: verifyError, data } = await supabase.auth.verifyOtp({
      phone: phoneValue,
      token: nextToken,
      type: 'sms',
    });

    if (verifyError) {
      const remaining = Math.max(0, attemptsRemaining - 1);
      setAttemptsRemaining(remaining);
      setDigits(['', '', '', '', '', '']);
      submittedTokenRef.current = null;
      inputRefs.current[0]?.focus();
      setError(`Code incorrect. ${remaining} attempts remaining.`);
      setLoading(false);
      return;
    }

    try {
      let profile = await fetchMe(data.session?.access_token);
      if (
        flow === 'register' &&
        displayNameValue &&
        (!profile.displayName ||
          profile.displayName === phoneValue ||
          profile.displayName.startsWith('User '))
      ) {
        profile = await updateProfile(displayNameValue);
      }
      syncProfileToStore(profile);
      router.replace(getPostAuthRoute(profile));
    } catch {
      router.replace('/(auth)/role-select');
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError(null);
    const { error: resendError } = await supabase.auth.signInWithOtp({
      phone: phoneValue,
      options: {
        shouldCreateUser: flow === 'register',
      },
    });

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setResendSeconds(60);
    setAttemptsRemaining(5);
  }

  function updateDigit(index: number, value: string) {
    const numeric = value.replace(/\D/g, '');

    if (numeric.length > 1) {
      const nextDigits = numeric.slice(0, 6).split('');
      setDigits(Array.from({ length: 6 }, (_, i) => nextDigits[i] ?? ''));
      inputRefs.current[Math.min(nextDigits.length, 5)]?.focus();
      return;
    }

    setDigits((current) => {
      const next = [...current];
      next[index] = numeric;
      return next;
    });

    if (numeric && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  if (!phoneValue) {
    return (
      <AuthScreenLayout title="Enter verification code">
        <Text style={styles.error}>Phone number missing. Please try again.</Text>
        <PrimaryButton
          label="Back to sign in"
          onPress={() => router.replace('/(auth)/login')}
        />
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Enter verification code"
      subtitle={`We sent a 6-digit code to ${maskPhone(phoneValue)}.`}
    >
      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[styles.otpBox, error ? styles.otpBoxError : null]}
            value={digit}
            onChangeText={(value) => updateDigit(index, value)}
            onKeyPress={({ nativeEvent }) => {
              if (
                nativeEvent.key === 'Backspace' &&
                !digits[index] &&
                index > 0
              ) {
                inputRefs.current[index - 1]?.focus();
              }
            }}
            keyboardType="number-pad"
            maxLength={1}
            textContentType="oneTimeCode"
            autoFocus={index === 0}
            editable={attemptsRemaining > 0 && !loading}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label="Verify"
        onPress={() => void verifyToken()}
        loading={loading}
        disabled={token.length !== 6 || attemptsRemaining <= 0}
      />

      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't get code?</Text>
        <Pressable
          disabled={resendSeconds > 0}
          onPress={() => void resendCode()}
        >
          <Text
            style={[
              styles.resendLink,
              resendSeconds > 0 && styles.resendLinkDisabled,
            ]}
          >
            {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend'}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.replace('/(auth)/register')}>
        <Text style={styles.switchLink}>Use email registration instead</Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  otpBox: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.compact,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    backgroundColor: colors.neutral[0],
    textAlign: 'center',
    ...typography.h2,
    color: colors.neutral[900],
  },
  otpBoxError: {
    borderColor: colors.red.error,
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  resendText: {
    ...typography.body,
    color: colors.neutral[600],
  },
  resendLink: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    color: colors.neutral[400],
  },
  switchLink: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

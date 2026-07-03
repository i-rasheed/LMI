import { SignupRole } from '@lmi/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../src/components/auth/AuthScreenLayout';
import { LogoutButton } from '../../src/components/auth/LogoutButton';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { setRole } from '../../src/services/auth.service';
import { syncProfileToStore } from '../../src/services/profile-sync';
import { colors, radius, spacing, typography } from '../../src/theme';

const ROLES: Array<{
  role: SignupRole;
  title: string;
  description: string;
}> = [
  {
    role: 'shopper',
    title: 'Shopper',
    description: 'Find the best prices and save on your market run',
  },
  {
    role: 'reporter',
    title: 'Reporter',
    description: 'Share prices and build your reputation',
  },
  {
    role: 'vendor',
    title: 'Vendor',
    description: 'List your stall and reach more customers',
  },
];

export default function RoleSelectScreen() {
  const [selected, setSelected] = useState<SignupRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    if (!selected) {
      setError('Select how you will use LMI');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await setRole(selected);
      syncProfileToStore(profile);
      router.replace('/(auth)/onboarding/step-1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="How will you use LMI?"
      showBack={false}
      headerRight={<LogoutButton />}
    >
      <View style={styles.list}>
        {ROLES.map((item) => {
          const active = selected === item.role;
          return (
            <Pressable
              key={item.role}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelected(item.role)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label={selected ? `Continue as ${ROLES.find((r) => r.role === selected)?.title}` : 'Continue'}
        onPress={onContinue}
        loading={loading}
        disabled={!selected}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  cardActive: {
    borderColor: colors.green.primary,
    backgroundColor: colors.green.light,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: colors.neutral[600],
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});

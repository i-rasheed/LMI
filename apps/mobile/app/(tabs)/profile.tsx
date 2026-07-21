import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchSubscriptionStatus } from '../../src/services/subscriptions.service';
import { useAuthStore } from '../../src/stores/authStore';
import { setStoredLanguage } from '../../src/i18n';
import { formatUserRole, getUserDisplayName } from '../../src/utils/user-display';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function ProfileScreen() {
  const role = useAuthStore((state) => state.role);
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const displayName = getUserDisplayName(profile, user);
  const needsName = !displayName;
  const { i18n } = useTranslation();
  const isPidgin = i18n.language === 'pcm';
  const subscriptionQuery = useQuery({
    queryKey: queryKeys.subscriptions.me,
    queryFn: fetchSubscriptionStatus,
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{displayName ?? 'Add your name'}</Text>
        <Text style={styles.subtitle}>Signed in as {formatUserRole(role)}</Text>
        {needsName ? (
          <Text style={styles.nameHint}>Add your name so it shows instead of your email.</Text>
        ) : null}
        <Pressable
          style={styles.editNameButton}
          onPress={() => router.push('/profile/edit-name')}
        >
          <Text style={styles.editNameText}>
            {needsName ? 'Add your name' : 'Edit name'}
          </Text>
        </Pressable>
        <Text style={styles.premiumStatus}>
          {subscriptionQuery.data?.isPremium ? 'LMI Premium active' : 'Free plan'}
        </Text>
      </View>
      <Pressable
        style={styles.menuButton}
        onPress={() => router.push('/profile/favourites')}
      >
        <Text style={styles.menuText}>Favourites</Text>
      </Pressable>
      <Pressable
        style={styles.menuButton}
        onPress={() => router.push('/profile/subscription')}
      >
        <Text style={styles.menuText}>Subscription</Text>
      </Pressable>
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.menuText}>Pidgin English</Text>
          <Text style={styles.toggleHint}>Translate common app copy</Text>
        </View>
        <Switch
          value={isPidgin}
          onValueChange={(value) => void setStoredLanguage(value ? 'pcm' : 'en')}
          trackColor={{ true: colors.green.light, false: colors.neutral[100] }}
          thumbColor={isPidgin ? colors.green.primary : colors.neutral[400]}
        />
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={() => router.push('/profile/delete-account')}
      >
        <Text style={styles.deleteText}>Delete account</Text>
      </Pressable>
      <Pressable style={styles.signOutButton} onPress={() => void signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.large,
    padding: spacing.lg,
  },
  name: {
    ...typography.h1,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  nameHint: {
    ...typography.caption,
    color: colors.amber.warning,
    marginTop: spacing.sm,
  },
  editNameButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  editNameText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  premiumStatus: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  signOutButton: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.neutral[400],
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.button,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.red.error,
  },
  menuButton: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.button,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  toggleRow: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.button,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    flexDirection: 'row',
  },
  toggleHint: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  signOutText: {
    ...typography.body,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  deleteText: {
    ...typography.body,
    color: colors.red.error,
    fontWeight: '700',
  },
});

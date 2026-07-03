import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { colors, radius, spacing, typography } from '../src/theme';

export default function BlockedScreen() {
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account suspended</Text>
      <Text style={styles.body}>
        {profile?.accountStatus === 'banned'
          ? 'Your account has been banned from LMI.'
          : 'Your account is temporarily suspended.'}
      </Text>
      <Text style={styles.body}>Contact support@lmi.ng if you need help.</Text>
      <Pressable
        style={styles.supportButton}
        onPress={() => void Linking.openURL('mailto:support@lmi.ng')}
      >
        <Text style={styles.supportText}>Contact support</Text>
      </Pressable>
      <Pressable
        style={styles.signOutButton}
        onPress={() => {
          void signOut();
          router.replace('/(auth)/welcome');
        }}
      >
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
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  body: {
    ...typography.body,
    color: colors.neutral[600],
  },
  supportButton: {
    backgroundColor: colors.green.primary,
    borderRadius: radius.button,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  supportText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '600',
  },
  signOutButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  signOutText: {
    ...typography.body,
    color: colors.neutral[600],
    fontWeight: '600',
  },
});

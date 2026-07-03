import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';

export function LogoutButton() {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);

  if (!session) {
    return null;
  }

  const onLogout = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Log out"
      hitSlop={8}
      onPress={() => void onLogout()}
      style={styles.button}
    >
      <Ionicons name="log-out-outline" size={18} color={colors.neutral[600]} />
      <Text style={styles.text}>Log out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  text: {
    ...typography.body,
    color: colors.neutral[600],
    fontWeight: '600',
  },
});

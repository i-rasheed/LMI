import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, typography } from '../../theme';

interface GoogleOAuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleOAuthButton({
  onPress,
  loading = false,
  disabled = false,
}: GoogleOAuthButtonProps) {
  return (
    <Pressable
      style={[styles.button, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.neutral[900]} />
      ) : (
        <Text style={styles.label}>Continue with Google</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.neutral[400],
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
});

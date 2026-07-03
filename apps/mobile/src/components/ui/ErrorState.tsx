import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface ErrorStateProps {
  headline?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  headline = "Couldn't load prices",
  message = 'Something went wrong. Try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    marginHorizontal: spacing.screenHorizontal,
    gap: spacing.sm,
    alignItems: 'center',
  },
  headline: {
    ...typography.h2,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.green.primary,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '600',
  },
});

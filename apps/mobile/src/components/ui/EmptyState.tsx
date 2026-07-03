import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface EmptyStateProps {
  headline: string;
  body?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export function EmptyState({
  headline,
  body,
  ctaLabel,
  onCtaPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.headline}>{headline}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {ctaLabel && onCtaPress ? (
        <Pressable style={styles.button} onPress={onCtaPress}>
          <Text style={styles.buttonText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  headline: {
    ...typography.h2,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  body: {
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

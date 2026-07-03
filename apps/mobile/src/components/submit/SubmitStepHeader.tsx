import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SubmitStepHeaderProps {
  title: string;
  step: number;
  totalSteps?: number;
  onBack?: () => void;
}

export function SubmitStepHeader({
  title,
  step,
  totalSteps = 4,
  onBack,
}: SubmitStepHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          onPress={onBack ?? (() => router.back())}
          style={styles.iconButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={colors.neutral[900]} />
        </Pressable>
        <Pressable
          onPress={() => router.dismiss()}
          style={styles.iconButton}
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={24} color={colors.neutral[900]} />
        </Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.dots}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[styles.dot, index + 1 <= step && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[100],
  },
  dotActive: {
    backgroundColor: colors.green.primary,
  },
});

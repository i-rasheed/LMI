import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface LocationBannerProps {
  onEnablePress: () => void;
}

export function LocationBanner({ onEnablePress }: LocationBannerProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="location-outline" size={20} color={colors.green.primary} />
      <View style={styles.content}>
        <Text style={styles.title}>See markets near you</Text>
        <Text style={styles.body}>Enable location to see nearby markets</Text>
      </View>
      <Pressable style={styles.button} onPress={onEnablePress}>
        <Text style={styles.buttonText}>Enable location</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.screenHorizontal,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.green.light,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.green.primary,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  body: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  buttonText: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '600',
  },
});

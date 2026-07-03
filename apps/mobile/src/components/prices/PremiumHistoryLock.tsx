import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface PremiumHistoryLockProps {
  onPress?: () => void;
}

export function PremiumHistoryLock({ onPress }: PremiumHistoryLockProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={20} color={colors.neutral[600]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Price history</Text>
        <Text style={styles.body}>Unlock price history with Premium</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.screenHorizontal,
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.compact,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
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
});

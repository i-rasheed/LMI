import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export function NetworkBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>No connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.red.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.screenHorizontal,
    alignItems: 'center',
  },
  text: {
    ...typography.caption,
    color: colors.neutral[0],
    fontWeight: '600',
  },
});

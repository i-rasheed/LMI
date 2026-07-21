import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { BrandLogo } from './BrandLogo';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <BrandLogo size={72} style={styles.logo} />
      <ActivityIndicator size="large" color={colors.green.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
    gap: spacing.lg,
  },
  logo: {
    marginBottom: spacing.sm,
  },
});

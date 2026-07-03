import { useQuery } from '@tanstack/react-query';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../src/components/PlaceholderScreen';
import { queryKeys } from '../src/lib/query-keys';
import { fetchAppConfig } from '../src/services/app-config.service';
import { colors, spacing, typography } from '../src/theme';

export default function ForceUpdateScreen() {
  const configQuery = useQuery({
    queryKey: queryKeys.appConfig,
    queryFn: fetchAppConfig,
  });
  const updateUrl = configQuery.data?.updateUrl;

  if (!updateUrl) {
    return (
      <PlaceholderScreen
        title="Update required"
        subtitle="Please update LMI from the App Store or Play Store."
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update required</Text>
      <Text style={styles.subtitle}>
        Please update LMI from the App Store or Play Store.
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => void Linking.openURL(updateUrl)}
      >
        <Text style={styles.buttonText}>Update LMI</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenHorizontal,
    backgroundColor: colors.neutral[100],
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.green.primary,
    borderRadius: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '700',
  },
});

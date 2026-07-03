import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { requestAccountDeletion } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore((state) => state.signOut);
  const [confirmation, setConfirmation] = useState('');

  const deleteMutation = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: async (result) => {
      const date = result.permanentDeleteAt
        ? new Date(result.permanentDeleteAt).toLocaleDateString()
        : '7 days';
      Alert.alert(
        'Deletion scheduled',
        `Your account is scheduled for deletion after ${date}. Sign in again within 7 days to cancel.`,
      );
      await signOut();
      router.replace('/(auth)/welcome');
    },
    onError: () => {
      Alert.alert('Could not schedule deletion', 'Please try again.');
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Delete account</Text>
      <Text style={styles.body}>
        This schedules your LMI account for deletion. Your profile, saved items,
        alerts, submissions, and subscriptions will be removed after the 7-day
        grace period.
      </Text>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>7-day grace period</Text>
        <Text style={styles.warningBody}>
          Sign in again within 7 days to cancel deletion automatically. After the
          grace period, deletion is permanent.
        </Text>
      </View>

      <Text style={styles.label}>Type DELETE to confirm</Text>
      <TextInput
        value={confirmation}
        onChangeText={setConfirmation}
        autoCapitalize="characters"
        placeholder="DELETE"
        placeholderTextColor={colors.neutral[400]}
        style={styles.input}
      />

      <PrimaryButton
        label="Schedule deletion"
        loading={deleteMutation.isPending}
        disabled={confirmation !== 'DELETE' || deleteMutation.isPending}
        onPress={() => deleteMutation.mutate()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.md,
  },
  back: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  body: {
    ...typography.body,
    color: colors.neutral[600],
  },
  warningCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.red.error,
    gap: spacing.sm,
  },
  warningTitle: {
    ...typography.body,
    color: colors.red.error,
    fontWeight: '700',
  },
  warningBody: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  label: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    padding: spacing.md,
    ...typography.body,
    color: colors.neutral[900],
  },
});

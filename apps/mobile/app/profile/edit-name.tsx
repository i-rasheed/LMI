import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@lmi/shared';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormField } from '../../src/components/auth/FormField';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { updateProfile } from '../../src/services/auth.service';
import { syncProfileToStore } from '../../src/services/profile-sync';
import { useAuthStore } from '../../src/stores/authStore';
import { getUserDisplayName } from '../../src/utils/user-display';
import { colors, spacing, typography } from '../../src/theme';

type EditNameForm = {
  displayName: string;
};

export default function EditProfileNameScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const currentName = getUserDisplayName(profile, user);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditNameForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: currentName ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const updated = await updateProfile(values.displayName.trim());
      syncProfileToStore(updated);
      router.back();
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error ? error.message : 'Could not save your name',
      });
    }
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Your name</Text>
      <Text style={styles.subtitle}>
        This is how you appear in the app after you sign in.
      </Text>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Full name"
            autoCapitalize="words"
            autoComplete="name"
            placeholder="e.g. Amaka Okafor"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.displayName?.message}
          />
        )}
      />
      {errors.root?.message ? (
        <Text style={styles.error}>{errors.root.message}</Text>
      ) : null}
      <PrimaryButton label="Save name" onPress={onSubmit} loading={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.md,
  },
  back: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});

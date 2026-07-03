import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing, typography } from '../../theme';

interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
  headerRight?: ReactNode;
}

export function AuthScreenLayout({
  title,
  subtitle,
  children,
  showBack = true,
  headerRight,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {showBack || headerRight ? (
          <View style={styles.header}>
            {showBack ? (
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            ) : (
              <View />
            )}
            {headerRight ?? <View />}
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.neutral[100] },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
  },
  content: {
    gap: spacing.md,
  },
});

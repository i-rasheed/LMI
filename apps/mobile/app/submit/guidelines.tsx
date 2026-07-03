import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckboxField } from '../../src/components/auth/CheckboxField';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { acceptGuidelines } from '../../src/services/auth.service';
import { syncProfileToStore } from '../../src/services/profile-sync';
import { colors, spacing, typography } from '../../src/theme';

const GUIDELINES = [
  'Report prices you see today.',
  'Include the correct unit (per kg, per piece, etc.).',
  'Add a photo when you can — it builds trust.',
  'One update per product per visit.',
  'Repeated false reports may lead to account review.',
];

export default function SubmitGuidelinesScreen() {
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    try {
      const profile = await acceptGuidelines();
      syncProfileToStore(profile);
      router.replace('/submit');
    } catch {
      router.replace('/submit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Help shoppers trust your prices</Text>
        <Text style={styles.intro}>
          Follow these guidelines so your submissions help everyone find fair
          prices.
        </Text>

        {GUIDELINES.map((rule) => (
          <View key={rule} style={styles.ruleRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}

        <CheckboxField
          label="I understand"
          checked={accepted}
          onToggle={() => setAccepted((value) => !value)}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label="Start submitting"
          disabled={!accepted}
          loading={loading}
          onPress={() => void handleContinue()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  intro: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bullet: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  ruleText: {
    ...typography.body,
    color: colors.neutral[900],
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
  },
});

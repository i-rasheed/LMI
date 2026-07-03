import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { useSubmitStore } from '../../src/stores/submitStore';
import {
  formatBadgeProgressText,
  formatBadgeName,
} from '../../src/utils/reporter';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function SubmitSuccessScreen() {
  const insets = useSafeAreaInsets();
  const lastSubmission = useSubmitStore((state) => state.lastSubmission);
  const reset = useSubmitStore((state) => state.reset);

  const stats = lastSubmission?.reporterStats;
  const [showBadgeModal, setShowBadgeModal] = useState(true);
  const badgeJustUnlocked = useMemo(
    () =>
      stats?.currentBadgeLevel != null &&
      stats.acceptedSubmissionCount > 0 &&
      [1, 10, 50, 200].includes(stats.acceptedSubmissionCount),
    [stats],
  );
  const progressText =
    stats != null
      ? formatBadgeProgressText(
          stats.acceptedSubmissionCount,
          stats.nextBadgeLevel,
          stats.submissionsUntilNextBadge,
        )
      : null;

  const progressPercent =
    stats?.submissionsUntilNextBadge != null &&
    stats.nextBadgeLevel != null
      ? Math.min(
          100,
          Math.round(
            (stats.acceptedSubmissionCount /
              (stats.acceptedSubmissionCount + stats.submissionsUntilNextBadge)) *
              100,
          ),
        )
      : stats?.nextBadgeLevel == null
        ? 100
        : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color={colors.green.primary} />
        </View>
        <Text style={styles.title}>Price submitted!</Text>

        {lastSubmission?.isAutoFlagged ? (
          <Text style={styles.subtitle}>
            Your price is under review because it looks unusual for this market.
          </Text>
        ) : null}

        {progressText ? (
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>{progressText}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
            {stats?.nextBadgeLevel ? (
              <Text style={styles.progressHint}>
                Next badge: {formatBadgeName(stats.nextBadgeLevel)}
              </Text>
            ) : null}
          </View>
        ) : null}

        {stats != null && stats.currentStreakDays > 1 ? (
          <Text style={styles.streak}>
            🔥 {stats.currentStreakDays}-day submission streak
          </Text>
        ) : null}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label="Submit another"
          onPress={() => {
            reset();
            router.replace('/submit');
          }}
        />
        <Pressable
          style={styles.doneButton}
          onPress={() => {
            reset();
            router.dismissAll();
          }}
        >
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
      <Modal
        visible={Boolean(badgeJustUnlocked && showBadgeModal)}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>★</Text>
            <Text style={styles.modalTitle}>Badge level up</Text>
            <Text style={styles.modalBody}>
              You are now a {formatBadgeName(stats?.currentBadgeLevel ?? null)} Reporter.
              Keep sharing fresh prices to build trust.
            </Text>
            <PrimaryButton
              label="Nice"
              onPress={() => setShowBadgeModal(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  iconWrap: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  progressCard: {
    width: '100%',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    marginBottom: spacing.lg,
  },
  progressLabel: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green.primary,
  },
  progressHint: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.sm,
  },
  streak: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.md,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  doneText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  modalCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.large,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  modalIcon: {
    ...typography.display,
    color: colors.green.primary,
  },
  modalTitle: {
    ...typography.h1,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  modalBody: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});

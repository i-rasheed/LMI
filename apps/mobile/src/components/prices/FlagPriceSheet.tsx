import { FlagReason } from '@lmi/shared';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '../auth/PrimaryButton';
import { ApiError } from '../../lib/api';
import { flagPriceSubmission } from '../../services/flags.service';
import { colors, radius, spacing, typography } from '../../theme';

const REASONS: Array<{ id: FlagReason; label: string }> = [
  { id: 'incorrect_price', label: 'Incorrect price' },
  { id: 'outdated', label: 'Outdated' },
  { id: 'spam', label: 'Spam' },
];

interface FlagPriceSheetProps {
  visible: boolean;
  submissionId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FlagPriceSheet({
  visible,
  submissionId,
  onClose,
  onSuccess,
}: FlagPriceSheetProps) {
  const [reason, setReason] = useState<FlagReason>('incorrect_price');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!submissionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await flagPriceSubmission(submissionId, {
        reason,
        comment: comment.trim() || undefined,
      });
      setComment('');
      setReason('incorrect_price');
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Could not submit report. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Report price</Text>
          <Pressable onPress={onClose} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.neutral[900]} />
          </Pressable>
        </View>

        <Text style={styles.subtitle}>Why are you reporting this price?</Text>

        <View style={styles.reasons}>
          {REASONS.map((item) => {
            const active = reason === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.reasonChip, active && styles.reasonChipActive]}
                onPress={() => setReason(item.id)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    active && styles.reasonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Optional comment</Text>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Add details (140 chars max)"
          placeholderTextColor={colors.neutral[400]}
          maxLength={140}
          multiline
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={colors.green.primary} />
        ) : (
          <PrimaryButton label="Submit report" onPress={() => void handleSubmit()} />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
  },
  sheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  reasons: {
    gap: spacing.sm,
  },
  reasonChip: {
    padding: spacing.md,
    borderRadius: radius.compact,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  reasonChipActive: {
    borderColor: colors.green.primary,
    backgroundColor: colors.green.light,
  },
  reasonText: {
    ...typography.body,
    color: colors.neutral[900],
  },
  reasonTextActive: {
    color: colors.green.primary,
    fontWeight: '600',
  },
  label: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.compact,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 80,
    ...typography.body,
    color: colors.neutral[900],
    textAlignVertical: 'top',
  },
  error: {
    ...typography.body,
    color: colors.red.error,
  },
});

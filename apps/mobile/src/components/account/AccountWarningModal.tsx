import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../auth/PrimaryButton';
import { AccountWarning } from '../../types/flags';
import { colors, radius, spacing, typography } from '../../theme';

interface AccountWarningModalProps {
  warning: AccountWarning | null;
  loading?: boolean;
  onAcknowledge: () => void;
}

export function AccountWarningModal({
  warning,
  loading = false,
  onAcknowledge,
}: AccountWarningModalProps) {
  return (
    <Modal visible={warning != null} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{warning?.title ?? 'Account notice'}</Text>
          <Text style={styles.body}>{warning?.body}</Text>
          <PrimaryButton
            label="I understand"
            loading={loading}
            onPress={onAcknowledge}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  body: {
    ...typography.body,
    color: colors.neutral[600],
  },
});

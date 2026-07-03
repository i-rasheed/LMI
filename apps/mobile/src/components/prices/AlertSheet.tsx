import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../auth/PrimaryButton';
import { AlertThreshold } from '../../types/favourites-alerts';
import { colors, radius, spacing, typography } from '../../theme';

const OPTIONS: Array<{ label: string; value: AlertThreshold }> = [
  { label: 'Any drop', value: 0 },
  { label: '10%', value: 10 },
  { label: '15%', value: 15 },
  { label: '20%', value: 20 },
];

interface AlertSheetProps {
  visible: boolean;
  threshold: AlertThreshold;
  loading?: boolean;
  onChangeThreshold: (threshold: AlertThreshold) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function AlertSheet({
  visible,
  threshold,
  loading = false,
  onChangeThreshold,
  onClose,
  onSubmit,
}: AlertSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Get price drop alerts</Text>
        <Text style={styles.body}>
          Notify me when price drops by:
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const active = threshold === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => onChangeThreshold(option.value)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          label="Set alert"
          loading={loading}
          onPress={onSubmit}
        />
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
  title: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  body: {
    ...typography.body,
    color: colors.neutral[600],
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    backgroundColor: colors.neutral[0],
  },
  optionActive: {
    borderColor: colors.green.primary,
    backgroundColor: colors.green.light,
  },
  optionText: {
    ...typography.body,
    color: colors.neutral[900],
  },
  optionTextActive: {
    color: colors.green.primary,
    fontWeight: '600',
  },
});

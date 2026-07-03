import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  error?: string;
}

export function CheckboxField({
  label,
  checked,
  onToggle,
  error,
}: CheckboxFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.row} onPress={onToggle}>
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? <Text style={styles.tick}>✓</Text> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
  },
  boxChecked: {
    backgroundColor: colors.green.primary,
    borderColor: colors.green.primary,
  },
  tick: {
    color: colors.neutral[0],
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    ...typography.body,
    color: colors.neutral[900],
    flex: 1,
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});

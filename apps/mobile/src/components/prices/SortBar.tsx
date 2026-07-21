import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { CompareSort } from '../../types/prices';
import { colors, radius, spacing, typography } from '../../theme';

const SORT_OPTIONS: Array<{ value: CompareSort; label: string }> = [
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'freshest', label: 'Freshest' },
];

interface SortBarProps {
  value: CompareSort;
  onChange: (sort: CompareSort) => void;
}

export function SortBar({ value, onChange }: SortBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SORT_OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  chipActive: {
    backgroundColor: colors.green.light,
    borderColor: colors.green.primary,
  },
  label: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  labelActive: {
    color: colors.green.primary,
  },
});

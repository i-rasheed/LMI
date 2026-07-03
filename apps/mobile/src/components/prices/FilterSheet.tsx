import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CompareFilters } from '../../types/prices';
import { colors, radius, spacing, typography } from '../../theme';

const UPDATED_OPTIONS = [
  { label: 'Any time', value: undefined },
  { label: 'Last 24 hours', value: 24 },
  { label: 'Last 3 days', value: 72 },
  { label: 'Last 7 days', value: 168 },
];

interface FilterSheetProps {
  visible: boolean;
  filters: CompareFilters;
  onChange: (filters: CompareFilters) => void;
  onClose: () => void;
  onApply: () => void;
}

export function FilterSheet({
  visible,
  filters,
  onChange,
  onClose,
  onApply,
}: FilterSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Filter</Text>

        <Text style={styles.label}>Market area</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Kosofe, Lagos Island"
          placeholderTextColor={colors.neutral[400]}
          value={filters.area ?? ''}
          onChangeText={(area) => onChange({ ...filters, area: area || undefined })}
        />

        <Text style={styles.label}>Max distance (km)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10"
          placeholderTextColor={colors.neutral[400]}
          keyboardType="numeric"
          value={filters.maxDistanceKm?.toString() ?? ''}
          onChangeText={(text) =>
            onChange({
              ...filters,
              maxDistanceKm: text ? Number(text) : undefined,
            })
          }
        />

        <Text style={styles.label}>Updated within</Text>
        <View style={styles.options}>
          {UPDATED_OPTIONS.map((option) => {
            const active = filters.updatedWithinHours === option.value;
            return (
              <Pressable
                key={option.label}
                style={[styles.option, active && styles.optionActive]}
                onPress={() =>
                  onChange({ ...filters, updatedWithinHours: option.value })
                }
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.applyButton} onPress={onApply}>
          <Text style={styles.applyText}>Apply filters</Text>
        </Pressable>
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
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.compact,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    ...typography.body,
    color: colors.neutral[900],
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    padding: spacing.md,
    borderRadius: radius.compact,
    borderWidth: 1,
    borderColor: colors.neutral[100],
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
  applyButton: {
    marginTop: spacing.md,
    backgroundColor: colors.green.primary,
    borderRadius: radius.button,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '600',
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme';

interface SubmitterLabelProps {
  displayName: string;
  source?: string;
}

export function SubmitterLabel({ displayName, source }: SubmitterLabelProps) {
  const label =
    source === 'vendor' ? `${displayName} · Vendor` : displayName;

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  name: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
  },
});

import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height, style }: SkeletonBoxProps) {
  return <View style={[styles.box, { width, height }, style]} />;
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.compact,
  },
});

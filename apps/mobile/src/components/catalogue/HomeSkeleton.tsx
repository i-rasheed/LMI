import { StyleSheet, View } from 'react-native';
import { SkeletonBox } from '../ui/SkeletonBox';
import { spacing } from '../../theme';

export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox height={28} width="60%" style={styles.greeting} />
      <SkeletonBox height={48} style={styles.search} />
      <SkeletonBox height={20} width="40%" style={styles.sectionTitle} />
      <View style={styles.row}>
        <SkeletonBox height={88} width={160} />
        <SkeletonBox height={88} width={160} />
        <SkeletonBox height={88} width={160} />
      </View>
      <SkeletonBox height={20} width="45%" style={styles.sectionTitle} />
      <View style={styles.chips}>
        <SkeletonBox height={36} width={100} />
        <SkeletonBox height={36} width={120} />
        <SkeletonBox height={36} width={90} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  greeting: {
    marginHorizontal: spacing.screenHorizontal,
  },
  search: {
    marginHorizontal: spacing.screenHorizontal,
    borderRadius: 24,
  },
  sectionTitle: {
    marginHorizontal: spacing.screenHorizontal,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screenHorizontal,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenHorizontal,
  },
});

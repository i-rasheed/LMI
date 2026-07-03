import { LineChart } from 'react-native-gifted-charts';
import { StyleSheet, Text, View } from 'react-native';
import { PriceHistoryPoint } from '../../types/prices';
import { colors, radius, spacing, typography } from '../../theme';

interface PriceHistoryChartProps {
  points: PriceHistoryPoint[];
}

export function PriceHistoryChart({ points }: PriceHistoryChartProps) {
  if (points.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Price history</Text>
        <Text style={styles.empty}>Not enough price data yet.</Text>
      </View>
    );
  }

  const data = points.map((point, index) => ({
    value: point.averagePriceNaira,
    label:
      index === 0 || index === points.length - 1
        ? point.date.slice(5)
        : '',
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price history</Text>
      <Text style={styles.subtitle}>90-day average price trend</Text>
      <LineChart
        data={data}
        height={150}
        curved
        hideDataPoints={points.length > 12}
        color={colors.green.primary}
        thickness={3}
        yAxisColor={colors.neutral[100]}
        xAxisColor={colors.neutral[100]}
        rulesColor={colors.neutral[100]}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        noOfSections={4}
        areaChart
        startFillColor={colors.green.light}
        endFillColor={colors.neutral[0]}
        startOpacity={0.8}
        endOpacity={0.1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenHorizontal,
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  title: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  empty: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  axisText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
});

const MIN_SAMPLES = 2;
const DEVIATION_THRESHOLD_PCT = 5;

export type PriceInsightTone = 'higher' | 'lower' | 'typical';

export interface PriceInsight {
  message: string;
  tone: PriceInsightTone;
  percentChange: number;
}

export function getPriceInsight(
  currentPriceNaira: number,
  averageNaira: number | null,
  sampleCount: number,
): PriceInsight | null {
  if (averageNaira == null || averageNaira <= 0 || sampleCount < MIN_SAMPLES) {
    return null;
  }

  const percentChange =
    ((currentPriceNaira - averageNaira) / averageNaira) * 100;

  if (percentChange > DEVIATION_THRESHOLD_PCT) {
    return {
      message:
        'Today looks higher than usual — unlock history to see the trend',
      tone: 'higher',
      percentChange,
    };
  }

  if (percentChange < -DEVIATION_THRESHOLD_PCT) {
    return {
      message:
        'Today looks lower than usual — unlock history to see the trend',
      tone: 'lower',
      percentChange,
    };
  }

  return {
    message: 'Prices are near the usual range — unlock history to track trends',
    tone: 'typical',
    percentChange,
  };
}

export interface MarketAverageResponse {
  productId: string;
  marketId: string;
  unit: string;
  averageNaira: number | null;
  sampleCount: number;
}

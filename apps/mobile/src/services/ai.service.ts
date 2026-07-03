import { apiRequest } from '../lib/api';
import { AiSearchResponse, AiTextResponse } from '../types/ai';

export function fetchAiSearchSuggestions(query: string): Promise<AiSearchResponse> {
  return apiRequest<AiSearchResponse>('/ai/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

export function explainOutlier(payload: {
  productName: string;
  marketName: string;
  unit: string;
  submittedPriceNaira: number;
  averagePriceNaira?: number | null;
}): Promise<AiTextResponse> {
  return apiRequest<AiTextResponse>('/ai/explain-outlier', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

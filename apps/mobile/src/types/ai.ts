export interface AiSearchResponse {
  suggestions: string[];
  didYouMean: string | null;
}

export interface AiTextResponse {
  summary: string;
}

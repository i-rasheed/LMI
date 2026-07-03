export interface AiSearchResponse {
  suggestions: string[];
  didYouMean: string | null;
}

export interface AiTextResponse {
  summary: string;
}

export interface AiDigestResponse {
  title: string;
  body: string;
  highlights: string[];
}

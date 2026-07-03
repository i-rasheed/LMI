import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiDigestInput,
  AiExplainOutlierInput,
  AiModerateInput,
  AiSearchInput,
} from '@lmi/shared';
import { ProductsService } from '../products/products.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AiDigestResponse, AiSearchResponse, AiTextResponse } from './ai.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model = process.env.GOOGLE_GEMINI_API_KEY
    ? new GoogleGenerativeAI(
        process.env.GOOGLE_GEMINI_API_KEY,
      ).getGenerativeModel({
        model: 'gemini-2.0-flash',
      })
    : null;

  constructor(
    private readonly productsService: ProductsService,
    private readonly supabase: SupabaseService,
  ) {}

  async search(input: AiSearchInput): Promise<AiSearchResponse> {
    const products = await this.productsService.searchProducts(input.query, 6);
    const fallbackSuggestions = products.map((product) => product.name);

    const text = await this.generateText(
      [
        'Return JSON only with keys suggestions:string[] and didYouMean:string|null.',
        'Help Lagos market shoppers with fuzzy product search and alias expansion.',
        `Query: ${input.query}`,
        `Known matches: ${fallbackSuggestions.join(', ') || 'none'}`,
      ].join('\n'),
    );

    const parsed = this.parseJson<AiSearchResponse>(text);
    return {
      suggestions:
        parsed?.suggestions?.slice(0, 6) ??
        fallbackSuggestions.slice(0, 6),
      didYouMean:
        parsed?.didYouMean ??
        (fallbackSuggestions[0]?.toLowerCase() !== input.query.toLowerCase()
          ? fallbackSuggestions[0] ?? null
          : null),
    };
  }

  async explainOutlier(input: AiExplainOutlierInput): Promise<AiTextResponse> {
    const average = input.averagePriceNaira
      ? `The recent average is ₦${input.averagePriceNaira.toLocaleString()}.`
      : 'There is no recent average for this exact item.';
    const fallback =
      `${input.productName} at ${input.marketName} looks unusual because ` +
      `₦${input.submittedPriceNaira.toLocaleString()} per ${input.unit} is far from recent market data. ${average} ` +
      'Confirm only if you saw this price today.';

    const summary = await this.generateText(
      [
        'Explain this price outlier in one short, plain-language paragraph for a Lagos reporter.',
        'Be calm, factual, and do not accuse the reporter.',
        `Product: ${input.productName}`,
        `Market: ${input.marketName}`,
        `Submitted: ₦${input.submittedPriceNaira} per ${input.unit}`,
        `Average: ${input.averagePriceNaira ?? 'unknown'}`,
      ].join('\n'),
      fallback,
    );

    return { summary };
  }

  async moderate(input: AiModerateInput): Promise<AiTextResponse> {
    const fallback =
      `Review ${input.productName} at ${input.marketName}: submitted price is ₦${input.submittedPriceNaira.toLocaleString()}` +
      `${input.averagePriceNaira ? ` against a recent average of ₦${input.averagePriceNaira.toLocaleString()}` : ''}. ` +
      `Flags: ${input.flagReasons.join(', ') || 'none'}. Check the photo, freshness, and reporter history before action.`;

    const summary = await this.generateText(
      [
        'Create a concise admin moderation summary and recommendation for a flagged market price.',
        'Mention context, risks, and a recommended action. Keep under 70 words.',
        `Product: ${input.productName}`,
        `Market: ${input.marketName}`,
        `Submitted price: ₦${input.submittedPriceNaira}`,
        `Average price: ${input.averagePriceNaira ?? 'unknown'}`,
        `Flag reasons: ${input.flagReasons.join(', ') || 'none'}`,
        `Reporter badge: ${input.reporterBadgeLevel ?? 'none'}`,
      ].join('\n'),
      fallback,
    );

    return { summary };
  }

  async digest(input: AiDigestInput): Promise<AiDigestResponse> {
    const rows = await this.fetchDigestRows(input);
    const highlights = rows.slice(0, 3).map((row) => {
      const product = row.products?.name ?? 'Market item';
      const market = row.markets?.name ?? 'a Lagos market';
      return `${product} is around ₦${Number(row.price_naira).toLocaleString()} at ${market}`;
    });

    const fallback: AiDigestResponse = {
      title: 'Your weekly market digest',
      body:
        highlights[0] ??
        'Prices are moving across Lagos markets. Check your saved products before your next market run.',
      highlights,
    };

    const text = await this.generateText(
      [
        'Return JSON only with title:string, body:string, highlights:string[].',
        'Write a premium weekly shopping digest for Lagos market shoppers.',
        'Keep the push body under 120 characters and highlights short.',
        `Area preference: ${input.area ?? 'any Lagos area'}`,
        `Price context: ${highlights.join(' | ') || 'no fresh price context'}`,
      ].join('\n'),
    );

    return this.parseJson<AiDigestResponse>(text) ?? fallback;
  }

  private async generateText(prompt: string, fallback = ''): Promise<string> {
    if (!this.model) {
      return fallback;
    }

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim() || fallback;
    } catch (error) {
      this.logger.warn(
        `Gemini request failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return fallback;
    }
  }

  private parseJson<T>(text: string): T | null {
    if (!text) {
      return null;
    }

    try {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }

  private async fetchDigestRows(input: AiDigestInput): Promise<
    Array<{
      price_naira: number;
      products: { name: string } | null;
      markets: { name: string; area: string } | null;
    }>
  > {
    let builder = this.supabase.db
      .from('current_prices')
      .select('price_naira, products!inner(name), markets!inner(name, area)')
      .order('submitted_at', { ascending: false })
      .limit(8);

    if (input.productIds?.length) {
      builder = builder.in('product_id', input.productIds);
    }

    if (input.area) {
      builder = builder.eq('markets.area', input.area);
    }

    const { data, error } = await builder;
    if (error) {
      throw error;
    }

    return (data as Array<{
      price_naira: number;
      products: { name: string } | Array<{ name: string }> | null;
      markets: { name: string; area: string } | Array<{ name: string; area: string }> | null;
    }> ?? []).map((row) => ({
      price_naira: row.price_naira,
      products: Array.isArray(row.products) ? row.products[0] : row.products,
      markets: Array.isArray(row.markets) ? row.markets[0] : row.markets,
    }));
  }
}

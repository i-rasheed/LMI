import { submitPriceSchema } from '../submit-price';
import { testIds } from '../../__tests__/fixtures';

describe('submitPriceSchema', () => {
  const valid = {
    marketId: testIds.marketId,
    productId: testIds.productId,
    priceNaira: 850,
    unit: 'kg' as const,
  };

  it('accepts valid submission', () => {
    expect(submitPriceSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects zero price', () => {
    expect(
      submitPriceSchema.safeParse({ ...valid, priceNaira: 0 }).success,
    ).toBe(false);
  });

  it('rejects price at or above ₦1,000,000', () => {
    expect(
      submitPriceSchema.safeParse({ ...valid, priceNaira: 1_000_000 }).success,
    ).toBe(false);
  });

  it('rejects decimal price', () => {
    expect(
      submitPriceSchema.safeParse({ ...valid, priceNaira: 850.5 }).success,
    ).toBe(false);
  });

  it('rejects invalid unit', () => {
    expect(
      submitPriceSchema.safeParse({ ...valid, unit: 'box' }).success,
    ).toBe(false);
  });

  it('accepts optional photo URL', () => {
    expect(
      submitPriceSchema.safeParse({
        ...valid,
        photoUrl: 'https://example.com/photo.webp',
      }).success,
    ).toBe(true);
  });
});

import { stallClaimSchema } from '../stall-claim';
import { testIds } from '../../__tests__/fixtures';

describe('stallClaimSchema', () => {
  const valid = {
    marketId: testIds.marketId,
    stallName: 'Mama Ngozi Tomatoes',
    categories: ['vegetables'],
    description: 'Fresh tomatoes and peppers from Oyingbo market row B.',
    locationHint: 'Row B, Stall 14',
  };

  it('accepts valid stall claim', () => {
    expect(stallClaimSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty categories', () => {
    expect(
      stallClaimSchema.safeParse({ ...valid, categories: [] }).success,
    ).toBe(false);
  });

  it('rejects description over 300 chars', () => {
    expect(
      stallClaimSchema.safeParse({
        ...valid,
        description: 'a'.repeat(301),
      }).success,
    ).toBe(false);
  });

  it('rejects more than 5 photos', () => {
    const photos = Array.from(
      { length: 6 },
      (_, i) => `https://example.com/${i}.jpg`,
    );
    expect(
      stallClaimSchema.safeParse({ ...valid, photos }).success,
    ).toBe(false);
  });
});

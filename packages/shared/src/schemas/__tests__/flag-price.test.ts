import { flagPriceSchema } from '../flag-price';
import { testIds } from '../../__tests__/fixtures';

describe('flagPriceSchema', () => {
  it('accepts valid flag with reason only', () => {
    expect(
      flagPriceSchema.safeParse({
        submissionId: testIds.submissionId,
        reason: 'incorrect_price',
      }).success,
    ).toBe(true);
  });

  it('accepts optional comment up to 140 chars', () => {
    expect(
      flagPriceSchema.safeParse({
        submissionId: testIds.submissionId,
        reason: 'outdated',
        comment: 'Price was much higher when I visited yesterday',
      }).success,
    ).toBe(true);
  });

  it('rejects comment over 140 chars', () => {
    expect(
      flagPriceSchema.safeParse({
        submissionId: testIds.submissionId,
        reason: 'spam',
        comment: 'x'.repeat(141),
      }).success,
    ).toBe(false);
  });

  it('rejects invalid reason', () => {
    expect(
      flagPriceSchema.safeParse({
        submissionId: testIds.submissionId,
        reason: 'fake',
      }).success,
    ).toBe(false);
  });
});

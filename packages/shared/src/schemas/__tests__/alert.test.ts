import { alertSchema, alertThresholdSchema } from '../alert';
import { testIds } from '../../__tests__/fixtures';

describe('alertSchema', () => {
  it('accepts valid alert with default threshold', () => {
    const result = alertSchema.safeParse({ productId: testIds.productId });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.thresholdPercentage).toBe(15);
      expect(result.data.isActive).toBe(true);
    }
  });

  it('accepts any-drop threshold (0)', () => {
    expect(
      alertSchema.safeParse({
        productId: testIds.productId,
        thresholdPercentage: 0,
      }).success,
    ).toBe(true);
  });

  it('rejects invalid threshold', () => {
    expect(
      alertSchema.safeParse({
        productId: testIds.productId,
        thresholdPercentage: 25,
      }).success,
    ).toBe(false);
  });
});

describe('alertThresholdSchema', () => {
  it.each([0, 10, 15, 20] as const)('accepts %i', (threshold) => {
    expect(alertThresholdSchema.safeParse(threshold).success).toBe(true);
  });
});

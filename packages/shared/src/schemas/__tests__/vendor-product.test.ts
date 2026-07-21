import { vendorProductSchema } from '../vendor-product';
import { testIds } from '../../__tests__/fixtures';

describe('vendorProductSchema', () => {
  const valid = {
    productId: testIds.productId,
    priceNaira: 1200,
    unit: 'kg' as const,
    isAvailableToday: true,
  };

  it('accepts valid vendor product', () => {
    expect(vendorProductSchema.safeParse(valid).success).toBe(true);
  });

  it('requires availability toggle', () => {
    expect(
      vendorProductSchema.safeParse({ ...valid, isAvailableToday: undefined })
        .success,
    ).toBe(false);
  });

  it('rejects invalid price', () => {
    expect(
      vendorProductSchema.safeParse({ ...valid, priceNaira: -1 }).success,
    ).toBe(false);
  });

  it('accepts manual product name without category', () => {
    expect(
      vendorProductSchema.safeParse({
        productName: 'Watermelon',
        priceNaira: 1200,
        unit: 'kg',
        isAvailableToday: true,
      }).success,
    ).toBe(true);
  });

  it('requires a product name', () => {
    const result = vendorProductSchema.safeParse({
      priceNaira: 1200,
      unit: 'kg',
      isAvailableToday: true,
    });

    expect(result.success).toBe(false);
  });
});

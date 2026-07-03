import {
  FREEMIUM_LIMITS,
  ALERT_THRESHOLDS,
  PRICE_LIMITS,
} from '../index';

describe('constants', () => {
  it('exports PRD freemium limits', () => {
    expect(FREEMIUM_LIMITS.SHOPPING_LIST_ITEMS).toBe(5);
    expect(FREEMIUM_LIMITS.PRICE_ALERTS).toBe(3);
    expect(FREEMIUM_LIMITS.FAVOURITES).toBe(10);
  });

  it('aligns alert thresholds with DB constraint', () => {
    expect(ALERT_THRESHOLDS).toEqual([0, 10, 15, 20]);
  });

  it('aligns price limits with DB constraint', () => {
    expect(PRICE_LIMITS.MIN_NAIRA).toBe(1);
    expect(PRICE_LIMITS.MAX_NAIRA).toBe(999_999);
  });
});

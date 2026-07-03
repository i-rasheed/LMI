/** PRD §7.2 freemium boundaries for free-tier shoppers. */
export const FREEMIUM_LIMITS = {
  SHOPPING_LIST_ITEMS: 5,
  PRICE_ALERTS: 3,
  FAVOURITES: 10,
} as const;

export const PRICE_LIMITS = {
  MIN_NAIRA: 1,
  MAX_NAIRA: 999_999,
} as const;

export const ALERT_THRESHOLDS = [0, 10, 15, 20] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const DUPLICATE_SUBMISSION_MINUTES = 30;

export const OUTLIER_DEVIATION_PERCENT = 50;

export const FLAG_ESCALATION_COUNT = 3;

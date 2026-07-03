export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatPriceUnit(priceNaira: number, unit: string): string {
  return `${formatNaira(priceNaira)} / ${unit}`;
}

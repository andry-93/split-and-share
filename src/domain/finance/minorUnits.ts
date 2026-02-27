import { getCurrencyDisplay } from '@/shared/utils/currency';
import { formatDecimalAmount } from '@/shared/utils/numberFormat';

export const MINOR_UNITS_SCALE = 100;

export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * MINOR_UNITS_SCALE);
}

export function fromMinorUnits(amountInMinor: number): number {
  if (!Number.isFinite(amountInMinor)) {
    return 0;
  }

  return amountInMinor / MINOR_UNITS_SCALE;
}

export function sumAmountsToMinor(amounts: readonly number[]): number {
  return amounts.reduce((sum, amount) => sum + toMinorUnits(amount), 0);
}

export function sumMinorUnits(amountsInMinor: readonly number[]): number {
  return amountsInMinor.reduce((sum, amount) => sum + amount, 0);
}

export function formatMoneyFromMinor(currency: string, amountInMinor: number, locale?: string): string {
  const display = getCurrencyDisplay(currency, locale);
  return `${display} ${formatDecimalAmount(fromMinorUnits(amountInMinor), locale)}`;
}

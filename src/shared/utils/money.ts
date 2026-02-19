import { getCurrencyDisplay } from '@/shared/utils/currency';
import { formatDecimalAmount, parseLocalizedMoneyAmount } from '@/shared/utils/numberFormat';

const MINOR_UNITS_SCALE = 100;

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

export function roundMoney(amount: number): number {
  return fromMinorUnits(toMinorUnits(amount));
}

export function parseMoneyAmount(input: string, locale?: string): number {
  const parsed = parseLocalizedMoneyAmount(input, locale);
  return Number.isFinite(parsed) ? roundMoney(parsed) : Number.NaN;
}

export function formatCurrencyAmount(currency: string, amount: number, locale?: string): string {
  const normalized = getCurrencyDisplay(currency, locale);
  const rounded = roundMoney(amount);
  return `${normalized} ${formatDecimalAmount(rounded, locale)}`;
}


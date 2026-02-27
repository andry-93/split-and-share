import { getCurrencyDisplay } from '@/shared/utils/currency';
import { formatDecimalAmount, parseLocalizedMoneyAmount } from '@/shared/utils/numberFormat';
import { fromMinorUnits, toMinorUnits } from '@/domain/finance/minorUnits';
export { fromMinorUnits, toMinorUnits } from '@/domain/finance/minorUnits';

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

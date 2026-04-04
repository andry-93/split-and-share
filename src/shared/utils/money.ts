import { getCurrencyDisplay } from '@/shared/utils/currency';
import {
  formatDecimalAmount,
  getDecimalSeparator,
  parseLocalizedMoneyAmount,
} from '@/shared/utils/numberFormat';
import { fromMinorUnits, toMinorUnits } from '@/domain/finance/minorUnits';
import { evaluateMathExpression } from '@/shared/utils/mathExpression';

export { fromMinorUnits, toMinorUnits } from '@/domain/finance/minorUnits';

export function roundMoney(amount: number): number {
  return fromMinorUnits(toMinorUnits(amount));
}

export function parseMoneyAmount(input: string, locale?: string): number {
  const normalized = input.trim();
  if (!normalized) {
    return Number.NaN;
  }

  // If input contains math operators, try evaluating it first
  if (/[+\-*/()]/.test(normalized)) {
    const decimalSeparator = getDecimalSeparator(locale);
    const evaluated = evaluateMathExpression(normalized, decimalSeparator);
    if (evaluated !== null) {
      return roundMoney(evaluated);
    }
  }

  const parsed = parseLocalizedMoneyAmount(normalized, locale);
  return Number.isFinite(parsed) ? roundMoney(parsed) : Number.NaN;
}

export function formatCurrencyAmount(currency: string, amount: number, locale?: string): string {
  const normalized = getCurrencyDisplay(currency, locale);
  const rounded = roundMoney(amount);
  return `${normalized} ${formatDecimalAmount(rounded, locale)}`;
}

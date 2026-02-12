const SUPPORTED_CURRENCY_CODES = new Set(['USD', 'EUR', 'GBP', 'RUB']);
const MINOR_UNITS_SCALE = 100;

export function normalizeCurrencyCode(currency?: string): string {
  if (!currency) {
    return 'USD';
  }

  return SUPPORTED_CURRENCY_CODES.has(currency) ? currency : 'USD';
}

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

export function formatCurrencyAmount(currency: string, amount: number): string {
  const normalized = normalizeCurrencyCode(currency);
  const rounded = roundMoney(amount);
  return `${normalized} ${rounded.toFixed(2)}`;
}

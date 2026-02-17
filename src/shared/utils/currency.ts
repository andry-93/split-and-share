const MINOR_UNITS_SCALE = 100;
const KNOWN_CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  RUB: '₽',
  BYN: 'Br',
};

export function normalizeCurrencyCode(currency?: string): string {
  const value = currency?.trim() ?? '';
  if (!value) {
    return 'USD';
  }

  const upperValue = value.toUpperCase();
  if (upperValue in KNOWN_CURRENCY_SYMBOLS) {
    return upperValue;
  }

  return value.slice(0, 10);
}

export function getCurrencySymbol(currency?: string): string | null {
  const normalized = normalizeCurrencyCode(currency);
  return KNOWN_CURRENCY_SYMBOLS[normalized] ?? null;
}

export function getCurrencyDisplay(currency?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  return getCurrencySymbol(normalized) ?? normalized;
}

export function getCurrencyOptionLabel(currency?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  const symbol = getCurrencySymbol(normalized);
  if (!symbol) {
    return normalized;
  }
  return `${normalized} (${symbol})`;
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
  const normalized = getCurrencyDisplay(currency);
  const rounded = roundMoney(amount);
  return `${normalized} ${rounded.toFixed(2)}`;
}

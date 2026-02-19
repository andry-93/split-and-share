const MINOR_UNITS_SCALE = 100;

export const SUPPORTED_CURRENCY_CODES = [
  'USD',
  'EUR',
  'GBP',
  'CNY',
  'INR',
  'JPY',
  'KRW',
  'BRL',
  'MXN',
  'RUB',
  'PLN',
  'UAH',
  'TRY',
  'BYN',
] as const;

const CURRENCY_META: Record<string, { name: string; symbol?: string }> = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  KRW: { name: 'South Korean Won', symbol: '₩' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
  MXN: { name: 'Mexican Peso', symbol: '$' },
  RUB: { name: 'Russian Ruble', symbol: '₽' },
  PLN: { name: 'Polish Zloty', symbol: 'zł' },
  UAH: { name: 'Ukrainian Hryvnia', symbol: '₴' },
  TRY: { name: 'Turkish Lira', symbol: '₺' },
  BYN: { name: 'Belarusian Ruble', symbol: 'Br' },
};

export function normalizeCurrencyCode(currency?: string): string {
  const value = currency?.trim() ?? '';
  if (!value) {
    return 'USD';
  }

  const upperValue = value.toUpperCase();
  if (upperValue in CURRENCY_META) {
    return upperValue;
  }

  return value.slice(0, 10);
}

export function getCurrencySymbol(currency?: string): string | null {
  const normalized = normalizeCurrencyCode(currency);
  return CURRENCY_META[normalized]?.symbol ?? null;
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

export function getCurrencyFriendlyLabel(currency?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  const meta = CURRENCY_META[normalized];
  if (!meta) {
    return getCurrencyOptionLabel(normalized);
  }
  return meta.symbol
    ? `${meta.name} (${normalized} • ${meta.symbol})`
    : `${meta.name} (${normalized})`;
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

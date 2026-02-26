const DEFAULT_LOCALE = 'en-US';

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

type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCY_CODES)[number];

type CurrencyMeta = {
  code: SupportedCurrencyCode;
  symbol: string;
  name: string;
};

const CURRENCY_LIST: CurrencyMeta[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
];

const SUPPORTED_CURRENCY_SET = new Set<string>(SUPPORTED_CURRENCY_CODES);
const CURRENCY_BY_CODE = CURRENCY_LIST.reduce<Record<SupportedCurrencyCode, CurrencyMeta>>((acc, item) => {
  acc[item.code] = item;
  return acc;
}, {} as Record<SupportedCurrencyCode, CurrencyMeta>);

// Kept for API compatibility with existing app wiring.
export function setGlobalCurrencyLocalePreference(_locale: string | null | undefined) {
  // no-op
}

export function normalizeCurrencyCode(currency?: string): string {
  const value = currency?.trim() ?? '';
  if (!value) {
    return 'USD';
  }

  const upperValue = value.toUpperCase();
  if (SUPPORTED_CURRENCY_SET.has(upperValue)) {
    return upperValue;
  }

  return value.slice(0, 10);
}

export function getCurrencySymbol(currency?: string, _locale?: string): string | null {
  const normalized = normalizeCurrencyCode(currency);
  if (!SUPPORTED_CURRENCY_SET.has(normalized)) {
    return null;
  }
  return CURRENCY_BY_CODE[normalized as SupportedCurrencyCode].symbol;
}

export function getCurrencyDisplay(currency?: string, locale?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  return getCurrencySymbol(normalized, locale) ?? normalized;
}

export function getCurrencyOptionLabel(currency?: string, locale?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  const symbol = getCurrencySymbol(normalized, locale);
  if (!symbol) {
    return normalized;
  }
  return `${normalized} (${symbol})`;
}

export function getCurrencyName(currency?: string, _locale?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  if (!SUPPORTED_CURRENCY_SET.has(normalized)) {
    return normalized;
  }
  return CURRENCY_BY_CODE[normalized as SupportedCurrencyCode].name;
}

export function getCurrencyFriendlyLabel(currency?: string, locale?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  const name = getCurrencyName(normalized, locale);
  const symbol = getCurrencySymbol(normalized, locale);
  return symbol ? `${name} (${normalized} • ${symbol})` : `${name} (${normalized})`;
}

export { DEFAULT_LOCALE };

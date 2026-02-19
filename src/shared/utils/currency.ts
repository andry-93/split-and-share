const MINOR_UNITS_SCALE = 100;
const DEFAULT_LOCALE = 'en-US';
const WHITESPACE_REGEX = /[\s\u00A0\u202F]/g;
const GROUPING_APOSTROPHE_REGEX = /['\u2019]/g;
const INVALID_AMOUNT_CHARS_REGEX = /[^0-9,.-]/g;
const NUMBER_FORMAT_CACHE = new Map<string, Intl.NumberFormat>();
type NumberFormatPreference = 'system' | 'us' | 'eu' | 'ru' | 'ch';
let globalNumberFormatPreference: NumberFormatPreference = 'system';

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

export function getCurrencyName(currency?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  return CURRENCY_META[normalized]?.name ?? normalized;
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

function resolveLocale(locale?: string): string {
  if (locale?.trim()) {
    return locale;
  }

  if (globalNumberFormatPreference === 'us') {
    return 'en-US';
  }
  if (globalNumberFormatPreference === 'eu') {
    return 'de-DE';
  }
  if (globalNumberFormatPreference === 'ru') {
    return 'ru-RU';
  }
  if (globalNumberFormatPreference === 'ch') {
    return 'de-CH';
  }

  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
    if (resolved?.trim()) {
      return resolved;
    }
  } catch {
    // Keep default locale if Intl APIs are unavailable.
  }

  return DEFAULT_LOCALE;
}

export function setGlobalNumberFormatPreference(
  preference: NumberFormatPreference | null | undefined,
) {
  globalNumberFormatPreference =
    preference === 'us' ||
    preference === 'eu' ||
    preference === 'ru' ||
    preference === 'ch'
      ? preference
      : 'system';
}

function getNumberFormatter(locale?: string): Intl.NumberFormat {
  const resolvedLocale = resolveLocale(locale);
  const cacheKey = resolvedLocale;
  const cached = NUMBER_FORMAT_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat(resolvedLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  NUMBER_FORMAT_CACHE.set(cacheKey, formatter);
  return formatter;
}

function getDecimalSeparator(locale?: string): '.' | ',' {
  try {
    const parts = new Intl.NumberFormat(resolveLocale(locale)).formatToParts(1.1);
    const decimal = parts.find((part) => part.type === 'decimal')?.value;
    return decimal === ',' ? ',' : '.';
  } catch {
    return '.';
  }
}

export function formatMoneyInputValue(amount: number, locale?: string): string {
  const rounded = roundMoney(amount);
  try {
    return new Intl.NumberFormat(resolveLocale(locale), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(rounded);
  } catch {
    return rounded.toFixed(2);
  }
}

export function getAmountInputPlaceholder(locale?: string): string {
  return `0${getDecimalSeparator(locale)}00`;
}

export function parseLocalizedMoneyAmount(input: string, locale?: string): number {
  const normalizedInput = input
    .replace(WHITESPACE_REGEX, '')
    .replace(GROUPING_APOSTROPHE_REGEX, '')
    .replace(INVALID_AMOUNT_CHARS_REGEX, '')
    .trim();

  if (!normalizedInput) {
    return Number.NaN;
  }

  const isNegative = normalizedInput.startsWith('-');
  const unsigned = normalizedInput.replace(/^-/, '');
  const lastDot = unsigned.lastIndexOf('.');
  const lastComma = unsigned.lastIndexOf(',');
  const localeDecimal = getDecimalSeparator(locale);

  let decimalSeparator: '.' | ',' | null = null;
  if (lastDot !== -1 && lastComma !== -1) {
    decimalSeparator = lastDot > lastComma ? '.' : ',';
  } else if (lastDot !== -1 || lastComma !== -1) {
    const sep = lastDot !== -1 ? '.' : ',';
    const parts = unsigned.split(sep);
    const digitsAfter = parts[parts.length - 1]?.length ?? 0;

    if (parts.length === 2) {
      decimalSeparator = digitsAfter <= 2 ? (sep as '.' | ',') : null;
      if (digitsAfter === 3 && sep === localeDecimal) {
        decimalSeparator = null;
      }
    } else {
      decimalSeparator = sep === localeDecimal && digitsAfter <= 2 ? (sep as '.' | ',') : null;
    }
  }

  const thousandsSeparator = decimalSeparator === '.' ? ',' : '.';
  let normalized = unsigned.replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '');
  if (decimalSeparator) {
    normalized = normalized.replace(new RegExp(`\\${decimalSeparator}`, 'g'), '.');
  } else {
    normalized = normalized.replace(/[.,]/g, '');
  }

  const numeric = Number(isNegative ? `-${normalized}` : normalized);
  if (!Number.isFinite(numeric)) {
    return Number.NaN;
  }

  return roundMoney(numeric);
}

export function formatCurrencyAmount(currency: string, amount: number, locale?: string): string {
  const normalized = getCurrencyDisplay(currency);
  const rounded = roundMoney(amount);
  return `${normalized} ${getNumberFormatter(locale).format(rounded)}`;
}

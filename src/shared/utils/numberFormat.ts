const DEFAULT_LOCALE = 'en-US';
const WHITESPACE_REGEX = /[\s\u00A0\u202F]/g;
const GROUPING_APOSTROPHE_REGEX = /['\u2019]/g;
const INVALID_AMOUNT_CHARS_REGEX = /[^0-9,.-]/g;
const NUMBER_FORMAT_CACHE = new Map<string, Intl.NumberFormat>();

export type NumberFormatPreference = 'system' | 'us' | 'eu' | 'ru' | 'ch';

let globalNumberFormatPreference: NumberFormatPreference = 'system';

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

export function resolveNumberLocale(locale?: string): string {
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

export function formatDecimalAmount(amount: number, locale?: string): string {
  const resolvedLocale = resolveNumberLocale(locale);
  let formatter = NUMBER_FORMAT_CACHE.get(resolvedLocale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(resolvedLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    NUMBER_FORMAT_CACHE.set(resolvedLocale, formatter);
  }
  return formatter.format(amount);
}

function getDecimalSeparator(locale?: string): '.' | ',' {
  try {
    const parts = new Intl.NumberFormat(resolveNumberLocale(locale)).formatToParts(1.1);
    const decimal = parts.find((part) => part.type === 'decimal')?.value;
    return decimal === ',' ? ',' : '.';
  } catch {
    return '.';
  }
}

export function formatMoneyInputValue(amount: number, locale?: string): string {
  try {
    return new Intl.NumberFormat(resolveNumberLocale(locale), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(amount);
  } catch {
    return amount.toFixed(2);
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
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}


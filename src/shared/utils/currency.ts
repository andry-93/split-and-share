const DEFAULT_LOCALE = 'en-US';
const CURRENCY_NAME_CACHE = new Map<string, Intl.DisplayNames | null>();
let globalCurrencyLocalePreference = DEFAULT_LOCALE;

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

const SUPPORTED_CURRENCY_SET = new Set<string>(SUPPORTED_CURRENCY_CODES);

const FALLBACK_CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  RUB: 'Russian Ruble',
  PLN: 'Polish Zloty',
  UAH: 'Ukrainian Hryvnia',
  TRY: 'Turkish Lira',
  BYN: 'Belarusian Ruble',
};

const FALLBACK_CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  INR: '₹',
  JPY: '¥',
  KRW: '₩',
  BRL: 'R$',
  MXN: '$',
  RUB: '₽',
  PLN: 'zł',
  UAH: '₴',
  TRY: '₺',
  BYN: 'Br',
};

function getDisplayNames(locale: string): Intl.DisplayNames | null {
  const cached = CURRENCY_NAME_CACHE.get(locale);
  if (cached !== undefined) {
    return cached;
  }
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'currency' });
    CURRENCY_NAME_CACHE.set(locale, displayNames);
    return displayNames;
  } catch {
    CURRENCY_NAME_CACHE.set(locale, null);
    return null;
  }
}

function resolveNameFromDisplayNames(currencyCode: string, locale: string): string | null {
  const displayNames = getDisplayNames(locale);
  const resolvedName = displayNames?.of(currencyCode)?.trim();
  if (!resolvedName || resolvedName.toUpperCase() === currencyCode) {
    return null;
  }
  return resolvedName;
}

function resolveNameFromNumberFormat(currencyCode: string, locale: string): string | null {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'name',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(1);
    const intlName = parts.find((part) => part.type === 'currency')?.value?.trim();
    if (!intlName || intlName.toUpperCase() === currencyCode) {
      return null;
    }
    return intlName;
  } catch {
    return null;
  }
}

function resolveCurrencyLocale(locale?: string): string {
  if (locale?.trim()) {
    return locale;
  }
  if (globalCurrencyLocalePreference?.trim()) {
    return globalCurrencyLocalePreference;
  }
  return DEFAULT_LOCALE;
}

function capitalizeFirstLetter(value: string, locale: string): string {
  if (!value) {
    return value;
  }
  const first = value.charAt(0);
  return `${first.toLocaleUpperCase(locale)}${value.slice(first.length)}`;
}

export function setGlobalCurrencyLocalePreference(locale: string | null | undefined) {
  globalCurrencyLocalePreference = locale?.trim() ? locale : DEFAULT_LOCALE;
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

export function getCurrencySymbol(currency?: string, locale?: string): string | null {
  const normalized = normalizeCurrencyCode(currency);
  const resolvedLocale = resolveCurrencyLocale(locale);

  // Try selected locale first.
  try {
    const parts = new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency: normalized,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    const symbol = parts.find((part) => part.type === 'currency')?.value?.trim();
    if (!symbol || symbol.toUpperCase() === normalized) {
      return FALLBACK_CURRENCY_SYMBOLS[normalized] ?? null;
    }
    return symbol;
  } catch {
    // Fall through to secondary locale and fallback map.
  }

  // Try stable default locale next.
  try {
    const parts = new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: normalized,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    const symbol = parts.find((part) => part.type === 'currency')?.value?.trim();
    if (symbol && symbol.toUpperCase() !== normalized) {
      return symbol;
    }
  } catch {
    // Fall through to fallback map.
  }

  return FALLBACK_CURRENCY_SYMBOLS[normalized] ?? null;
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

export function getCurrencyName(currency?: string, locale?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  const resolvedLocale = resolveCurrencyLocale(locale);

  const nameFromPrimaryLocale =
    resolveNameFromDisplayNames(normalized, resolvedLocale) ??
    resolveNameFromNumberFormat(normalized, resolvedLocale);
  if (nameFromPrimaryLocale) {
    return capitalizeFirstLetter(nameFromPrimaryLocale, resolvedLocale);
  }

  // If translation for selected language is unavailable, fallback to default locale.
  const nameFromDefaultLocale =
    resolveNameFromDisplayNames(normalized, DEFAULT_LOCALE) ??
    resolveNameFromNumberFormat(normalized, DEFAULT_LOCALE);
  if (nameFromDefaultLocale) {
    return capitalizeFirstLetter(nameFromDefaultLocale, DEFAULT_LOCALE);
  }

  return capitalizeFirstLetter(FALLBACK_CURRENCY_NAMES[normalized] ?? normalized, resolvedLocale);
}

export function getCurrencyFriendlyLabel(currency?: string, locale?: string): string {
  const normalized = normalizeCurrencyCode(currency);
  const name = getCurrencyName(normalized, locale);
  const symbol = getCurrencySymbol(normalized, locale);
  return symbol
    ? `${name} (${normalized} • ${symbol})`
    : `${name} (${normalized})`;
}

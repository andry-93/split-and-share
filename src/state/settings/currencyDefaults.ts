import { normalizeCurrencyCode, SUPPORTED_CURRENCY_CODES } from '@/shared/utils/currency';

const SUPPORTED_CURRENCY_SET = new Set<string>(SUPPORTED_CURRENCY_CODES);

const REGION_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  AT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  LU: 'EUR',
  FI: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  SI: 'EUR',
  SK: 'EUR',
  CY: 'EUR',
  MT: 'EUR',
  CN: 'CNY',
  IN: 'INR',
  BR: 'BRL',
  MX: 'MXN',
  JP: 'JPY',
  KR: 'KRW',
  RU: 'RUB',
  PL: 'PLN',
  UA: 'UAH',
  TR: 'TRY',
  BY: 'BYN',
};

const LANGUAGE_TO_CURRENCY: Record<string, string> = {
  en: 'USD',
  es: 'EUR',
  zh: 'CNY',
  hi: 'INR',
  ja: 'JPY',
  ko: 'KRW',
  pl: 'PLN',
  uk: 'UAH',
};

const TIMEZONE_TO_REGION: Record<string, string> = {
  'Europe/Minsk': 'BY',
  'Europe/Moscow': 'RU',
  'Asia/Shanghai': 'CN',
  'Asia/Kolkata': 'IN',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Europe/Warsaw': 'PL',
  'Europe/Kyiv': 'UA',
  'Europe/Istanbul': 'TR',
  'America/Sao_Paulo': 'BR',
  'America/Mexico_City': 'MX',
  'America/New_York': 'US',
};

function getSystemLocale() {
  try {
    return Intl.DateTimeFormat().resolvedOptions();
  } catch {
    return { locale: 'en-US', timeZone: 'UTC' } as Intl.ResolvedDateTimeFormatOptions;
  }
}

function extractRegionFromLocale(localeValue: string) {
  if (!localeValue) {
    return '';
  }

  try {
    const intlLocale = new Intl.Locale(localeValue);
    if (intlLocale.region) {
      return intlLocale.region.toUpperCase();
    }
  } catch {
    // Fallback below.
  }

  const parts = localeValue.split(/[-_]/).filter(Boolean);
  for (let index = 1; index < parts.length; index += 1) {
    const part = parts[index];
    if (/^[A-Za-z]{2}$/.test(part)) {
      return part.toUpperCase();
    }
  }

  return '';
}

function normalizeSupportedCurrency(value?: string) {
  const normalized = normalizeCurrencyCode(value);
  if (!SUPPORTED_CURRENCY_SET.has(normalized)) {
    return 'USD';
  }
  return normalized;
}

export function getSystemDefaultCurrency() {
  const { locale, timeZone } = getSystemLocale();
  const localeValue = locale ?? 'en-US';
  const [languageRaw] = localeValue.split(/[-_]/);
  const language = (languageRaw ?? 'en').toLowerCase();
  const timezoneRegion = TIMEZONE_TO_REGION[timeZone ?? ''] ?? '';
  const localeRegion = extractRegionFromLocale(localeValue);
  const region = timezoneRegion || localeRegion;

  if (region && REGION_TO_CURRENCY[region]) {
    return normalizeSupportedCurrency(REGION_TO_CURRENCY[region]);
  }

  if (LANGUAGE_TO_CURRENCY[language]) {
    return normalizeSupportedCurrency(LANGUAGE_TO_CURRENCY[language]);
  }

  return 'USD';
}

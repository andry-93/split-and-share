import { format, parseISO } from 'date-fns';
import { de, enUS, es, fr, hi, it, ja, ko, pl, pt, ru, uk, zhCN } from 'date-fns/locale';
import type { Locale } from 'date-fns';

const DEFAULT_LOCALE = 'en-US';
const DATE_TOKEN_SAMPLE = new Date(2006, 10, 22);
const DIGIT_REGEX = /\d/g;

const DATE_FNS_LOCALE_BY_PREFIX: Record<string, Locale> = {
  en: enUS,
  es,
  zh: zhCN,
  hi,
  de,
  fr,
  pt,
  ja,
  ko,
  it,
  ru,
  pl,
  uk,
};

const DATE_FNS_LOCALE_BY_EXACT: Record<string, Locale> = {};

function resolveLocale(locale?: string): string {
  if (locale?.trim()) {
    return locale;
  }

  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
    if (resolved?.trim()) {
      return resolved;
    }
  } catch {
    // Use default locale fallback.
  }

  return DEFAULT_LOCALE;
}

function resolveDateFnsLocale(locale?: string): Locale {
  const resolved = resolveLocale(locale).toLowerCase();
  return (
    DATE_FNS_LOCALE_BY_EXACT[resolved] ??
    DATE_FNS_LOCALE_BY_PREFIX[resolved.split(/[-_]/)[0]] ??
    enUS
  );
}

function toDate(value: Date | string): Date {
  if (value instanceof Date) {
    return value;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;
}

export function formatDateLocalized(
  value: Date | string,
  pattern = 'P',
  locale?: string,
): string {
  const parsed = toDate(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return format(parsed, pattern, { locale: resolveDateFnsLocale(locale) });
}

export function formatShortEventDate(value?: string | null, locale?: string): string {
  if (!value) {
    return '';
  }

  return formatDateLocalized(value, 'PP', locale);
}

export function formatDateTimeLocalized(value?: string | null, locale?: string): string {
  if (!value) {
    return '—';
  }

  const formatted = formatDateLocalized(value, 'PP p', locale);
  return formatted || '—';
}

export function getDateInputPlaceholder(locale?: string): string {
  const sample = format(DATE_TOKEN_SAMPLE, 'P', { locale: resolveDateFnsLocale(locale) });
  return sample.replace(DIGIT_REGEX, 'D').replace(/D{4}/g, 'YYYY').replace(/D{2}/g, 'DD');
}

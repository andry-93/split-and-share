export type SupportedLanguageCode =
  | 'EN'
  | 'ES'
  | 'ZH'
  | 'HI'
  | 'DE'
  | 'FR'
  | 'PT'
  | 'JA'
  | 'KO'
  | 'IT'
  | 'RU'
  | 'PL'
  | 'UK';

export const SUPPORTED_LANGUAGE_OPTIONS: Array<{ value: SupportedLanguageCode; label: string }> = [
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Español' },
  { value: 'ZH', label: '中文' },
  { value: 'HI', label: 'हिन्दी' },
  { value: 'DE', label: 'Deutsch' },
  { value: 'FR', label: 'Français' },
  { value: 'PT', label: 'Português' },
  { value: 'JA', label: '日本語' },
  { value: 'KO', label: '한국어' },
  { value: 'IT', label: 'Italiano' },
  { value: 'RU', label: 'Русский язык' },
  { value: 'PL', label: 'Polski' },
  { value: 'UK', label: 'Українська мова' },
];

const LANGUAGE_BASE_ORDER: SupportedLanguageCode[] = [
  'EN',
  'ES',
  'ZH',
  'HI',
  'PT',
  'DE',
  'FR',
  'JA',
  'KO',
  'IT',
  'RU',
  'PL',
  'UK',
];

const LEGACY_LANGUAGE_NAME_TO_CODE: Record<string, SupportedLanguageCode> = {
  english: 'EN',
  spanish: 'ES',
  chinese: 'ZH',
  hindi: 'HI',
  german: 'DE',
  french: 'FR',
  portuguese: 'PT',
  japanese: 'JA',
  korean: 'KO',
  italian: 'IT',
  russian: 'RU',
  polish: 'PL',
  ukrainian: 'UK',
};

const LOCALE_PREFIX_TO_CODE: Record<string, SupportedLanguageCode> = {
  en: 'EN',
  es: 'ES',
  zh: 'ZH',
  hi: 'HI',
  de: 'DE',
  fr: 'FR',
  pt: 'PT',
  ja: 'JA',
  ko: 'KO',
  it: 'IT',
  ru: 'RU',
  pl: 'PL',
  uk: 'UK',
  ua: 'UK',
};

const SUPPORTED_CODES_SET = new Set<string>(SUPPORTED_LANGUAGE_OPTIONS.map((item) => item.value));

export function normalizeLanguageCode(value: string | undefined | null): SupportedLanguageCode {
  const raw = `${value ?? ''}`.trim();
  if (!raw) {
    return 'EN';
  }

  const upper = raw.toUpperCase();
  if (SUPPORTED_CODES_SET.has(upper)) {
    return upper as SupportedLanguageCode;
  }

  const lower = raw.toLowerCase();
  if (LEGACY_LANGUAGE_NAME_TO_CODE[lower]) {
    return LEGACY_LANGUAGE_NAME_TO_CODE[lower];
  }

  const localePrefix = lower.split(/[-_]/)[0];
  if (LOCALE_PREFIX_TO_CODE[localePrefix]) {
    return LOCALE_PREFIX_TO_CODE[localePrefix];
  }

  return 'EN';
}

const LANGUAGE_LABEL_BY_CODE: Record<SupportedLanguageCode, string> = SUPPORTED_LANGUAGE_OPTIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<SupportedLanguageCode, string>,
);

const LANGUAGE_OPTION_BY_CODE: Record<SupportedLanguageCode, { value: SupportedLanguageCode; label: string }> =
  SUPPORTED_LANGUAGE_OPTIONS.reduce(
    (acc, item) => {
      acc[item.value] = item;
      return acc;
    },
    {} as Record<SupportedLanguageCode, { value: SupportedLanguageCode; label: string }>,
  );

const LANGUAGE_LOCALE_BY_CODE: Record<SupportedLanguageCode, string> = {
  EN: 'en-US',
  ES: 'es-ES',
  ZH: 'zh-CN',
  HI: 'hi-IN',
  DE: 'de-DE',
  FR: 'fr-FR',
  PT: 'pt-PT',
  JA: 'ja-JP',
  KO: 'ko-KR',
  IT: 'it-IT',
  RU: 'ru-RU',
  PL: 'pl-PL',
  UK: 'uk-UA',
};

export function getLanguageLabel(value: string | undefined | null): string {
  const code = normalizeLanguageCode(value);
  return LANGUAGE_LABEL_BY_CODE[code];
}

export function getOrderedLanguageOptions(
  selectedLanguage: string | undefined | null,
  systemLanguage: string | undefined | null,
) {
  const selectedCode = normalizeLanguageCode(selectedLanguage);
  const systemCode = normalizeLanguageCode(systemLanguage);
  const orderedCodes = [selectedCode, systemCode, ...LANGUAGE_BASE_ORDER].filter(
    (code, index, array) => array.indexOf(code) === index,
  );

  return orderedCodes.map((code) => LANGUAGE_OPTION_BY_CODE[code]);
}

export function getLanguageLocale(value: string | undefined | null): string {
  const code = normalizeLanguageCode(value);
  return LANGUAGE_LOCALE_BY_CODE[code];
}

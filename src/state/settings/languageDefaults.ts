const SUPPORTED_LANGUAGE_BY_PREFIX: Record<string, string> = {
  ru: 'Russian',
  de: 'German',
  es: 'Spanish',
  fr: 'French',
  en: 'English',
};

function getSystemLocale() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale ?? 'en';
  } catch {
    return 'en';
  }
}

export function getSystemDefaultLanguage() {
  const locale = getSystemLocale().toLowerCase();
  const languagePrefix = locale.split(/[-_]/)[0] ?? 'en';
  return SUPPORTED_LANGUAGE_BY_PREFIX[languagePrefix] ?? 'English';
}

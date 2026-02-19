import { normalizeLanguageCode } from '@/state/settings/languageCatalog';

function getSystemLocale() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale ?? 'en';
  } catch {
    return 'en';
  }
}

export function getSystemDefaultLanguage() {
  const locale = getSystemLocale();
  return normalizeLanguageCode(locale);
}

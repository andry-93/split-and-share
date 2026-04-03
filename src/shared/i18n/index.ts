import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/shared/i18n/locales/en';
import es from '@/shared/i18n/locales/es';
import zh from '@/shared/i18n/locales/zh';
import hi from '@/shared/i18n/locales/hi';
import de from '@/shared/i18n/locales/de';
import fr from '@/shared/i18n/locales/fr';
import pt from '@/shared/i18n/locales/pt';
import ja from '@/shared/i18n/locales/ja';
import ko from '@/shared/i18n/locales/ko';
import it from '@/shared/i18n/locales/it';
import ru from '@/shared/i18n/locales/ru';
import pl from '@/shared/i18n/locales/pl';
import uk from '@/shared/i18n/locales/uk';
import { normalizeLanguageCode } from '@/state/settings/languageCatalog';

export const I18N_LANGUAGE_BY_CODE = {
  EN: 'en',
  ES: 'es',
  ZH: 'zh',
  HI: 'hi',
  DE: 'de',
  FR: 'fr',
  PT: 'pt',
  JA: 'ja',
  KO: 'ko',
  IT: 'it',
  RU: 'ru',
  PL: 'pl',
  UK: 'uk',
} as const;

export function resolveI18nLanguage(languageCode: string | null | undefined) {
  const normalizedCode = normalizeLanguageCode(languageCode);
  return I18N_LANGUAGE_BY_CODE[normalizedCode];
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh },
      hi: { translation: hi },
      de: { translation: de },
      fr: { translation: fr },
      pt: { translation: pt },
      ja: { translation: ja },
      ko: { translation: ko },
      it: { translation: it },
      ru: { translation: ru },
      pl: { translation: pl },
      uk: { translation: uk },
    },
  });
}

export default i18n;

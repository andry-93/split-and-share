import { useEffect } from 'react';
import i18n, { resolveI18nLanguage } from '@/shared/i18n';
import { getLanguageLocale } from '@/state/settings/languageCatalog';
import { useSettingsState } from '@/state/settings/settingsContext';
import { setGlobalCurrencyLocalePreference } from '@/shared/utils/currency';
import { setGlobalNumberFormatPreference } from '@/shared/utils/numberFormat';

/**
 * Hook to synchronize the Redux settings state with various global side-effects:
 * - i18next language state
 * - Global number formatting preferences
 * - Global currency locale preferences
 */
export function useSyncSettings() {
  const settings = useSettingsState();

  // Sync Number Format
  useEffect(() => {
    setGlobalNumberFormatPreference(settings.numberFormat);
  }, [settings.numberFormat]);

  // Sync Currency Locale
  useEffect(() => {
    setGlobalCurrencyLocalePreference(getLanguageLocale(settings.language));
  }, [settings.language]);

  // Sync I18n Language
  useEffect(() => {
    const nextLanguage = resolveI18nLanguage(settings.language);
    if (i18n.language !== nextLanguage) {
      void i18n.changeLanguage(nextLanguage);
    }
  }, [settings.language]);
}

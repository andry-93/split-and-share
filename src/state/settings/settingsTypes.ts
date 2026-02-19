export type SettingsState = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  languageSource: 'system' | 'manual';
  numberFormat: 'system' | 'us' | 'eu' | 'ru' | 'ch';
  currency: string;
  currencySource: 'system' | 'manual';
  debtsViewMode: 'simplified' | 'detailed';
};

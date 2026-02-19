export type SettingsState = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  languageSource: 'system' | 'manual';
  currency: string;
  currencySource: 'system' | 'manual';
  debtsViewMode: 'simplified' | 'detailed';
};

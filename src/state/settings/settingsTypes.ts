export type SettingsState = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  languageSource: 'system' | 'manual';
  currency: string;
  debtsViewMode: 'simplified' | 'detailed';
};

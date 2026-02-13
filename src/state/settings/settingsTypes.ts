export type SettingsState = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  languageSource: 'system' | 'manual';
  currency: string;
};

export type SettingsAction =
  | { type: 'settings/theme'; payload: { theme: SettingsState['theme'] } }
  | { type: 'settings/language'; payload: { language: string } }
  | { type: 'settings/currency'; payload: { currency: string } };

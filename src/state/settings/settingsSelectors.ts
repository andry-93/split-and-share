import { RootState } from '@/state/store';
import { SettingsState } from '@/state/settings/settingsTypes';

export const selectSettingsState = (state: RootState): SettingsState => state.settings;
export const selectThemeMode = (state: RootState): SettingsState['theme'] => state.settings.theme;
export const selectLanguage = (state: RootState): string => state.settings.language;
export const selectNumberFormat = (state: RootState): SettingsState['numberFormat'] =>
  state.settings.numberFormat;
export const selectCurrency = (state: RootState): string => state.settings.currency;
export const selectDebtsViewMode = (state: RootState): SettingsState['debtsViewMode'] =>
  state.settings.debtsViewMode;

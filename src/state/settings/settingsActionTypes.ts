import { SettingsState } from '@/state/settings/settingsTypes';

export type SetThemePayload = { theme: SettingsState['theme'] };
export type SetLanguagePayload = { language: string };
export type SetCurrencyPayload = { currency: string };
export type SetDebtsViewModePayload = { debtsViewMode: SettingsState['debtsViewMode'] };

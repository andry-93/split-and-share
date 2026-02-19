import { SettingsState } from '@/state/settings/settingsTypes';

export type SetThemePayload = { theme: SettingsState['theme'] };
export type SetLanguagePayload = { language: string };
export type SetNumberFormatPayload = { numberFormat: SettingsState['numberFormat'] };
export type SetCurrencyPayload = { currency: string };
export type SetDebtsViewModePayload = { debtsViewMode: SettingsState['debtsViewMode'] };

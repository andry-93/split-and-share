import { SettingsState } from '@/state/settings/settingsTypes';

export type SetThemePayload = { theme: SettingsState['theme'] };
export type SetLanguagePayload = { language: string };
export type SetNumberFormatPayload = { numberFormat: SettingsState['numberFormat'] };
export type SetCurrencyPayload = { currency: string };
export type SetDebtsViewModePayload = { debtsViewMode: SettingsState['debtsViewMode'] };

export type SetSecurityEnabledPayload = { isSecurityEnabled: boolean };
export type SetBiometricsEnabledPayload = { isBiometricsEnabled: boolean };
export type SetMasterPasswordHashPayload = { masterPasswordHash: string | null };
export type SetAutoLockGracePeriodPayload = { autoLockGracePeriod: number };

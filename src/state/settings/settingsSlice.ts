import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createDefaultSettingsState } from '@/state/defaultState';
import { SettingsState } from '@/state/settings/settingsTypes';
import { getSystemDefaultCurrency } from '@/state/settings/currencyDefaults';
import { getSystemDefaultLanguage } from '@/state/settings/languageDefaults';
import {
  SetCurrencyPayload,
  SetDebtsViewModePayload,
  SetLanguagePayload,
  SetNumberFormatPayload,
  SetSecurityEnabledPayload,
  SetBiometricsEnabledPayload,
  SetMasterPasswordHashPayload,
  SetAutoLockGracePeriodPayload,
  SetThemePayload,
} from '@/state/settings/settingsActionTypes';
import { normalizeLanguageCode } from '@/state/settings/languageCatalog';

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: createDefaultSettingsState(),
  reducers: {
    setTheme: (state, action: PayloadAction<SetThemePayload>) => {
      state.theme = action.payload.theme;
    },
    setLanguage: (state, action: PayloadAction<SetLanguagePayload>) => {
      state.language = normalizeLanguageCode(action.payload.language);
      state.languageSource = 'manual';
    },
    setLanguageSystem: (state) => {
      state.language = getSystemDefaultLanguage();
      state.languageSource = 'system';
    },
    setNumberFormat: (state, action: PayloadAction<SetNumberFormatPayload>) => {
      state.numberFormat = action.payload.numberFormat;
    },
    setCurrency: (state, action: PayloadAction<SetCurrencyPayload>) => {
      state.currency = action.payload.currency;
      state.currencySource = 'manual';
    },
    setCurrencySystem: (state) => {
      state.currency = getSystemDefaultCurrency();
      state.currencySource = 'system';
    },
    setDebtsViewMode: (state, action: PayloadAction<SetDebtsViewModePayload>) => {
      state.debtsViewMode = action.payload.debtsViewMode;
    },
    setSecurityEnabled: (state, action: PayloadAction<SetSecurityEnabledPayload>) => {
      state.isSecurityEnabled = action.payload.isSecurityEnabled;
    },
    setBiometricsEnabled: (state, action: PayloadAction<SetBiometricsEnabledPayload>) => {
      state.isBiometricsEnabled = action.payload.isBiometricsEnabled;
    },
    setMasterPasswordHash: (state, action: PayloadAction<SetMasterPasswordHashPayload>) => {
      state.masterPasswordHash = action.payload.masterPasswordHash;
    },
    setAutoLockGracePeriod: (state, action: PayloadAction<SetAutoLockGracePeriodPayload>) => {
      state.autoLockGracePeriod = action.payload.autoLockGracePeriod;
    },
    rehydrateSettings: (_, action: PayloadAction<SettingsState>) => action.payload,
    resetSettings: () => createDefaultSettingsState(),
  },
});

export const settingsActions = settingsSlice.actions;

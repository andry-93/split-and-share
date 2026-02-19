import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createDefaultSettingsState } from '@/state/defaultState';
import { getSystemDefaultCurrency } from '@/state/settings/currencyDefaults';
import { getSystemDefaultLanguage } from '@/state/settings/languageDefaults';
import {
  SetCurrencyPayload,
  SetDebtsViewModePayload,
  SetLanguagePayload,
  SetNumberFormatPayload,
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
    resetSettings: () => createDefaultSettingsState(),
  },
});

export const settingsActions = settingsSlice.actions;

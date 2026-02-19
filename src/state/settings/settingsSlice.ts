import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createDefaultSettingsState } from '@/state/defaultState';
import {
  SetCurrencyPayload,
  SetDebtsViewModePayload,
  SetLanguagePayload,
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
    setCurrency: (state, action: PayloadAction<SetCurrencyPayload>) => {
      state.currency = action.payload.currency;
      state.currencySource = 'manual';
    },
    setDebtsViewMode: (state, action: PayloadAction<SetDebtsViewModePayload>) => {
      state.debtsViewMode = action.payload.debtsViewMode;
    },
    resetSettings: () => createDefaultSettingsState(),
  },
});

export const settingsActions = settingsSlice.actions;

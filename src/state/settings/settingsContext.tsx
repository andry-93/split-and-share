import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { readJSON, writeJSON } from '../storage/mmkv';
import { parseSettingsState } from '../storage/guards';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { getSystemDefaultLanguage } from './languageDefaults';
import { settingsReducer } from './settingsReducer';
import { SettingsAction, SettingsState } from './settingsTypes';

const SettingsStateContext = createContext<SettingsState | undefined>(undefined);
const SettingsDispatchContext = createContext<React.Dispatch<SettingsAction> | undefined>(undefined);

function initState(): SettingsState {
  const persistedState = readJSON<unknown>(STORAGE_KEYS.settings);
  const parsedState = parseSettingsState(persistedState);
  if (parsedState.languageSource === 'system') {
    return {
      ...parsedState,
      language: getSystemDefaultLanguage(),
    };
  }

  return parsedState;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, undefined, initState);

  return (
    <SettingsStateContext.Provider value={state}>
      <SettingsDispatchContext.Provider value={dispatch}>{children}</SettingsDispatchContext.Provider>
    </SettingsStateContext.Provider>
  );
}

export function useSettingsState() {
  const ctx = useContext(SettingsStateContext);
  if (!ctx) {
    throw new Error('useSettingsState must be used within SettingsProvider');
  }
  return ctx;
}

export function useSettingsActions() {
  const dispatch = useContext(SettingsDispatchContext);
  if (!dispatch) {
    throw new Error('useSettingsActions must be used within SettingsProvider');
  }

  return useMemo(
    () => ({
      setTheme: (value: SettingsState['theme']) => {
        dispatch({ type: 'settings/theme', payload: { theme: value } });
      },
      setLanguage: (value: string) => {
        dispatch({ type: 'settings/language', payload: { language: value } });
      },
      setCurrency: (value: string) => {
        dispatch({ type: 'settings/currency', payload: { currency: value } });
      },
    }),
    [dispatch],
  );
}

export function persistSettings(state: SettingsState) {
  writeJSON(STORAGE_KEYS.settings, state);
}

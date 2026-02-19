import { getSystemDefaultLanguage } from '@/state/settings/languageDefaults';
import { getSystemDefaultCurrency } from '@/state/settings/currencyDefaults';
import { SettingsState } from '@/state/settings/settingsTypes';
import { parseSettingsState } from '@/state/storage/guards';
import { readJSON, writeJSON } from '@/state/storage/mmkv';
import { STORAGE_KEYS } from '@/state/storage/storageKeys';

export function initSettingsState(): SettingsState {
  const persistedState = readJSON<unknown>(STORAGE_KEYS.settings);
  const parsedState = parseSettingsState(persistedState);
  const nextState = { ...parsedState };

  if (nextState.languageSource === 'system') {
    nextState.language = getSystemDefaultLanguage();
  }
  if (nextState.currencySource === 'system') {
    nextState.currency = getSystemDefaultCurrency();
  }

  return nextState;
}

export function persistSettings(state: SettingsState) {
  writeJSON(STORAGE_KEYS.settings, state);
}

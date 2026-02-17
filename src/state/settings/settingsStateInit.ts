import { getSystemDefaultLanguage } from '@/state/settings/languageDefaults';
import { SettingsState } from '@/state/settings/settingsTypes';
import { parseSettingsState } from '@/state/storage/guards';
import { readJSON, writeJSON } from '@/state/storage/mmkv';
import { STORAGE_KEYS } from '@/state/storage/storageKeys';

export function initSettingsState(): SettingsState {
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

export function persistSettings(state: SettingsState) {
  writeJSON(STORAGE_KEYS.settings, state);
}


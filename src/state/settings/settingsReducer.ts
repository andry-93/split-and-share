import { SettingsAction, SettingsState } from './settingsTypes';

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'settings/theme':
      return { ...state, theme: action.payload.theme };
    case 'settings/language':
      return { ...state, language: action.payload.language, languageSource: 'manual' };
    case 'settings/currency':
      return { ...state, currency: action.payload.currency };
    default:
      return state;
  }
}

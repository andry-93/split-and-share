import { useMemo } from 'react';
import { selectSettingsState } from '@/state/settings/settingsSelectors';
import { settingsActions } from '@/state/settings/settingsSlice';
import { SettingsState } from '@/state/settings/settingsTypes';
import { useAppDispatch, useAppSelector } from '@/state/store';

export function useSettingsState() {
  return useAppSelector(selectSettingsState);
}

export function useSettingsActions() {
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      setTheme: (value: SettingsState['theme']) => {
        dispatch(settingsActions.setTheme({ theme: value }));
      },
      setLanguage: (value: string) => {
        dispatch(settingsActions.setLanguage({ language: value }));
      },
      setLanguageSystem: () => {
        dispatch(settingsActions.setLanguageSystem());
      },
      setNumberFormat: (value: SettingsState['numberFormat']) => {
        dispatch(settingsActions.setNumberFormat({ numberFormat: value }));
      },
      setCurrency: (value: string) => {
        dispatch(settingsActions.setCurrency({ currency: value }));
      },
      setCurrencySystem: () => {
        dispatch(settingsActions.setCurrencySystem());
      },
      setDebtsViewMode: (value: SettingsState['debtsViewMode']) => {
        dispatch(settingsActions.setDebtsViewMode({ debtsViewMode: value }));
      },
      resetSettings: () => {
        dispatch(settingsActions.resetSettings());
      },
    }),
    [dispatch],
  );
}

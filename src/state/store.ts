import { configureStore } from '@reduxjs/toolkit';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { initEventsState } from '@/state/events/eventsStateInit';
import { eventsSlice } from '@/state/events/eventsSlice';
import { initPeopleState } from '@/state/people/peopleStateInit';
import { peopleSlice } from '@/state/people/peopleSlice';
import { persistSettings } from '@/state/settings/settingsStateInit';
import { initSettingsState } from '@/state/settings/settingsStateInit';
import { settingsActions } from '@/state/settings/settingsSlice';
import { settingsSlice } from '@/state/settings/settingsSlice';
import { SettingsState } from '@/state/settings/settingsTypes';

const preloadedState = {
  events: initEventsState(),
  people: initPeopleState(),
  settings: initSettingsState(),
} as const;

const settingsPersistenceListener = createListenerMiddleware();

settingsPersistenceListener.startListening({
  matcher: isAnyOf(
    settingsActions.setTheme,
    settingsActions.setLanguage,
    settingsActions.setLanguageSystem,
    settingsActions.setNumberFormat,
    settingsActions.setCurrency,
    settingsActions.setCurrencySystem,
    settingsActions.setDebtsViewMode,
    settingsActions.resetSettings,
  ),
  effect: (_, api) => {
    const state = api.getState() as { settings: SettingsState };
    persistSettings(state.settings);
  },
});

export const store = configureStore({
  reducer: {
    events: eventsSlice.reducer,
    people: peopleSlice.reducer,
    settings: settingsSlice.reducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(settingsPersistenceListener.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

import { configureStore } from '@reduxjs/toolkit';

import eventsReducer from './slices/events.slice';
import participantsReducer from './slices/participants.slice';
import expensesReducer from './slices/expenses.slice';
import uiReducer from './slices/ui.slice';

export const store = configureStore({
    reducer: {
        events: eventsReducer,
        participants: participantsReducer,
        expenses: expensesReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // важно для RN
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

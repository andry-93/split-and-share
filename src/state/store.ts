import { configureStore } from '@reduxjs/toolkit';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { eventsActions, eventsSlice } from '@/state/events/eventsSlice';
import { initEventsState, persistEvents } from '@/state/events/eventsStateInit';
import { initPeopleState, persistPeople } from '@/state/people/peopleStateInit';
import { peopleActions, peopleSlice } from '@/state/people/peopleSlice';
import { persistSettings } from '@/state/settings/settingsStateInit';
import { initSettingsState } from '@/state/settings/settingsStateInit';
import { settingsActions } from '@/state/settings/settingsSlice';
import { settingsSlice } from '@/state/settings/settingsSlice';
import { SettingsState } from '@/state/settings/settingsTypes';
import { trackProductEvent } from '@/shared/analytics/productAnalytics';

const settingsPersistenceListener = createListenerMiddleware();
const peoplePersistenceListener = createListenerMiddleware();
const eventsPersistenceListener = createListenerMiddleware();
const syncPeopleUpdatesListener = createListenerMiddleware();
const productAnalyticsListener = createListenerMiddleware();

settingsPersistenceListener.startListening({
  predicate: (action) =>
    typeof action.type === 'string' &&
    action.type.startsWith('settings/') &&
    !action.type.includes('rehydrate'),
  effect: (_, api) => {
    const state = api.getState() as any;
    persistSettings(state.settings);
  },
});

peoplePersistenceListener.startListening({
  predicate: (action) =>
    typeof action.type === 'string' &&
    action.type.startsWith('people/') &&
    !action.type.includes('rehydrate'),
  effect: (_, api) => {
    const state = api.getState() as any;
    persistPeople(state.people);
  },
});

eventsPersistenceListener.startListening({
  predicate: (action) =>
    typeof action.type === 'string' &&
    action.type.startsWith('events/') &&
    !action.type.includes('rehydrate'),
  effect: (_, api) => {
    const state = api.getState() as any;
    persistEvents(state.events);
  },
});

syncPeopleUpdatesListener.startListening({
  matcher: peopleActions.updatePerson.match,
  effect: (action, api) => {
    const { id, name, phone, email } = action.payload;
    api.dispatch(
      eventsActions.updateParticipantEverywhere({
        personId: id,
        name,
        phone,
        email,
      }),
    );
  },
});

productAnalyticsListener.startListening({
  matcher: isAnyOf(
    eventsActions.createEvent,
    eventsActions.updateEvent,
    eventsActions.removeEvents,
    eventsActions.createGroup,
    eventsActions.updateGroup,
    eventsActions.removeGroups,
    eventsActions.addExpense,
    eventsActions.updateExpense,
    eventsActions.removeExpenses,
    eventsActions.addParticipants,
    eventsActions.removeParticipants,
    eventsActions.registerPayment,
    peopleActions.addPerson,
    peopleActions.updatePerson,
    peopleActions.removeMany,
    peopleActions.addMany,
  ),
  effect: (action) => {
    if (eventsActions.createEvent.match(action)) {
      trackProductEvent('event_created', { eventId: action.payload.id });
      return;
    }
    if (eventsActions.updateEvent.match(action)) {
      trackProductEvent('event_updated', { eventId: action.payload.eventId });
      return;
    }
    if (eventsActions.removeEvents.match(action)) {
      trackProductEvent('event_deleted', { count: action.payload.eventIds.length });
      return;
    }
    if (eventsActions.createGroup.match(action)) {
      trackProductEvent('group_created', { groupId: action.payload.id });
      return;
    }
    if (eventsActions.updateGroup.match(action)) {
      trackProductEvent('group_updated', { groupId: action.payload.groupId });
      return;
    }
    if (eventsActions.removeGroups.match(action)) {
      trackProductEvent('group_deleted', { count: action.payload.groupIds.length });
      return;
    }
    if (eventsActions.addExpense.match(action)) {
      trackProductEvent('expense_created', { eventId: action.payload.eventId });
      return;
    }
    if (eventsActions.updateExpense.match(action)) {
      trackProductEvent('expense_updated', {
        eventId: action.payload.eventId,
        expenseId: action.payload.expenseId,
      });
      return;
    }
    if (eventsActions.removeExpenses.match(action)) {
      trackProductEvent('expense_deleted', {
        eventId: action.payload.eventId,
        count: action.payload.expenseIds.length,
      });
      return;
    }
    if (eventsActions.addParticipants.match(action)) {
      trackProductEvent('event_people_added', {
        eventId: action.payload.eventId,
        count: action.payload.participants.length,
      });
      return;
    }
    if (eventsActions.removeParticipants.match(action)) {
      trackProductEvent('event_people_removed', {
        eventId: action.payload.eventId,
        count: action.payload.participantIds.length,
      });
      return;
    }
    if (eventsActions.registerPayment.match(action)) {
      trackProductEvent('debt_marked_paid', {
        eventId: action.payload.eventId,
        source: action.payload.payment.source,
      });
      return;
    }
    if (peopleActions.addPerson.match(action)) {
      trackProductEvent('person_created', { personId: action.payload.id });
      return;
    }
    if (peopleActions.updatePerson.match(action)) {
      trackProductEvent('person_updated', { personId: action.payload.id });
      return;
    }
    if (peopleActions.removeMany.match(action)) {
      trackProductEvent('person_deleted', { count: action.payload.ids.length });
      return;
    }
    if (peopleActions.addMany.match(action)) {
      trackProductEvent('contacts_imported', { count: action.payload.people.length });
    }
  },
});

export const store = configureStore({
  reducer: {
    events: eventsSlice.reducer,
    people: peopleSlice.reducer,
    settings: settingsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      productAnalyticsListener.middleware,
      settingsPersistenceListener.middleware,
      peoplePersistenceListener.middleware,
      eventsPersistenceListener.middleware,
      syncPeopleUpdatesListener.middleware,
    ),
});

export function rehydrateStore() {
  const settings = initSettingsState();
  const people = initPeopleState();
  const events = initEventsState();

  store.dispatch(settingsActions.rehydrateSettings(settings));
  store.dispatch(peopleActions.rehydratePeople(people));
  store.dispatch(eventsActions.rehydrateEvents(events));
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

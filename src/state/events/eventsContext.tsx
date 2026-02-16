import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { ParticipantItem } from '@/features/events/types/events';
import { PersonItem } from '@/features/people/types/people';
import { readJSON, writeJSON } from '@/state/storage/mmkv';
import { parseEventsState } from '@/state/storage/guards';
import { STORAGE_KEYS } from '@/state/storage/storageKeys';
import { eventsReducer } from '@/state/events/eventsReducer';
import { EventsAction, EventsState } from '@/state/events/eventsTypes';
import { createEventPayment, PaymentSource } from '@/state/events/paymentsModel';
import { createDefaultEventsState } from '@/state/defaultState';
import { createEntityId } from '@/shared/utils/id';
import { normalizeOptionalText } from '@/shared/utils/validation';

const EventsStateContext = createContext<EventsState | undefined>(undefined);
const EventsDispatchContext = createContext<React.Dispatch<EventsAction> | undefined>(undefined);

function initState(): EventsState {
  const persistedEvents = readJSON<unknown>(STORAGE_KEYS.events);
  const parsed = parseEventsState(persistedEvents);
  const defaultState = createDefaultEventsState();
  if (defaultState.groups.length === 0 && defaultState.events.length === 0) {
    return parsed;
  }

  // Ensure mocked bootstrap data is available for product demos and future MMKV migrations.
  const mergedGroups = [
    ...parsed.groups,
    ...defaultState.groups.filter(
      (seedGroup) => !parsed.groups.some((group) => group.id === seedGroup.id),
    ),
  ];

  const mergedEvents = [
    ...parsed.events,
    ...defaultState.events.filter(
      (seedEvent) => !parsed.events.some((event) => event.id === seedEvent.id),
    ),
  ];

  return {
    ...parsed,
    groups: mergedGroups,
    events: mergedEvents,
  };
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(eventsReducer, undefined, initState);

  return (
    <EventsStateContext.Provider value={state}>
      <EventsDispatchContext.Provider value={dispatch}>{children}</EventsDispatchContext.Provider>
    </EventsStateContext.Provider>
  );
}

export function useEventsState() {
  const ctx = useContext(EventsStateContext);
  if (!ctx) {
    throw new Error('useEventsState must be used within EventsProvider');
  }
  return ctx;
}

export function useEventsActions() {
  const dispatch = useContext(EventsDispatchContext);
  if (!dispatch) {
    throw new Error('useEventsActions must be used within EventsProvider');
  }

  return useMemo(
    () => ({
      createEvent: (payload: { name: string; description?: string; currency?: string; date?: string | null; groupId?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Event name is required.');
        }

        dispatch({
          type: 'events/create',
          payload: {
            id: createEntityId('event'),
            name: trimmedName,
            description: normalizeOptionalText(payload.description),
            currency: payload.currency,
            date: payload.date ?? null,
            groupId: payload.groupId,
          },
        });
      },
      createGroup: (payload: { name: string; description?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Group name is required.');
        }

        dispatch({
          type: 'events/createGroup',
          payload: {
            id: createEntityId('group'),
            name: trimmedName,
            description: normalizeOptionalText(payload.description),
          },
        });
      },
      updateGroup: (payload: { groupId: string; name: string; description?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Group name is required.');
        }

        dispatch({
          type: 'events/updateGroup',
          payload: {
            groupId: payload.groupId,
            name: trimmedName,
            description: normalizeOptionalText(payload.description),
          },
        });
      },
      updateEvent: (payload: {
        eventId: string;
        name: string;
        description?: string;
        currency?: string;
        date?: string | null;
        groupId?: string;
      }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Event name is required.');
        }

        dispatch({
          type: 'events/update',
          payload: {
            eventId: payload.eventId,
            name: trimmedName,
            description: normalizeOptionalText(payload.description),
            currency: payload.currency,
            date: payload.date ?? null,
            groupId: payload.groupId,
          },
        });
      },
      addExpense: (payload: { eventId: string; expense: { title: string; amount: number; paidBy: string; paidById?: string } }) => {
        const trimmedTitle = payload.expense.title.trim();
        if (!trimmedTitle) {
          throw new Error('Expense title is required.');
        }

        if (!Number.isFinite(payload.expense.amount) || payload.expense.amount <= 0) {
          throw new Error('Amount must be a positive number.');
        }

        const nextExpense = {
          id: createEntityId('expense'),
          title: trimmedTitle,
          amount: payload.expense.amount,
          paidBy: payload.expense.paidBy,
          paidById: payload.expense.paidById,
        };

        dispatch({
          type: 'events/addExpense',
          payload: {
            eventId: payload.eventId,
            expense: nextExpense,
          },
        });
      },
      updateExpense: (payload: {
        eventId: string;
        expenseId: string;
        patch: { title: string; amount: number; paidBy: string; paidById?: string };
      }) => {
        const trimmedTitle = payload.patch.title.trim();
        if (!trimmedTitle) {
          throw new Error('Expense title is required.');
        }

        if (!Number.isFinite(payload.patch.amount) || payload.patch.amount <= 0) {
          throw new Error('Amount must be a positive number.');
        }

        dispatch({
          type: 'events/updateExpense',
          payload: {
            eventId: payload.eventId,
            expenseId: payload.expenseId,
            patch: {
              title: trimmedTitle,
              amount: payload.patch.amount,
              paidBy: payload.patch.paidBy,
              paidById: payload.patch.paidById,
            },
          },
        });
      },
      addPeopleToEvent: (payload: { eventId: string; people: PersonItem[] }) => {
        const participants: ParticipantItem[] = payload.people.map((person) => ({
          id: person.id,
          name: person.name,
          phone: person.phone,
          email: person.email,
          isMe: person.isMe,
        }));

        dispatch({
          type: 'events/addParticipants',
          payload: {
            eventId: payload.eventId,
            participants,
          },
        });
      },
      registerPayment: (payload: { eventId: string; fromId: string; toId: string; amount: number; source: PaymentSource }) => {
        dispatch({
          type: 'events/registerPayment',
          payload: {
            eventId: payload.eventId,
            payment: createEventPayment({
              id: createEntityId('payment'),
              eventId: payload.eventId,
              fromId: payload.fromId,
              toId: payload.toId,
              amount: payload.amount,
              source: payload.source,
            }),
          },
        });
      },
      removeParticipantsFromEvent: (payload: { eventId: string; participantIds: string[] }) => {
        dispatch({
          type: 'events/removeParticipants',
          payload,
        });
      },
      removePeopleEverywhere: (payload: { personIds: string[] }) => {
        dispatch({
          type: 'events/removePeopleEverywhere',
          payload,
        });
      },
      removeEvents: (payload: { eventIds: string[] }) => {
        dispatch({
          type: 'events/removeEvents',
          payload,
        });
      },
      removeGroups: (payload: { groupIds: string[] }) => {
        dispatch({
          type: 'events/removeGroups',
          payload,
        });
      },
      removeExpenses: (payload: { eventId: string; expenseIds: string[] }) => {
        dispatch({
          type: 'events/removeExpenses',
          payload,
        });
      },
    }),
    [dispatch],
  );
}

export function persistEvents(state: EventsState) {
  writeJSON(STORAGE_KEYS.events, state);
}

// selectors moved to eventsSelectors.ts

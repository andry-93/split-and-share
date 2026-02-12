import React, { createContext, useContext, useMemo, useReducer } from 'react';
import uuid from 'react-native-uuid';
import { EventItem, ExpenseItem, ParticipantItem } from '../../features/events/types/events';
import { initialEvents } from '../../features/events/data/initialEvents';
import { PersonItem } from '../../features/people/types/people';
import { readJSON, writeJSON } from '../storage/mmkv';
import { eventsReducer } from './eventsReducer';
import { EventsAction, EventsState } from './eventsTypes';
import { createEventPayment, PaymentSource } from './paymentsModel';

const EventsStateContext = createContext<EventsState | undefined>(undefined);
const EventsDispatchContext = createContext<React.Dispatch<EventsAction> | undefined>(undefined);

type PersistedEvents = EventsState;
function initState(): EventsState {
  const persistedEvents = readJSON<PersistedEvents>('events');
  if (persistedEvents) {
    return {
      events: persistedEvents.events ?? initialEvents,
      paymentsByEvent: persistedEvents.paymentsByEvent ?? {},
    };
  }

  return {
    events: initialEvents,
    paymentsByEvent: {},
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
      createEvent: (payload: { name: string; description?: string; currency?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Event name is required.');
        }

        dispatch({
          type: 'events/create',
          payload: {
            id: `event-${String(uuid.v4())}`,
            name: trimmedName,
            description: payload.description?.trim() || undefined,
            currency: payload.currency,
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

        const nextExpense: ExpenseItem = {
          id: `expense-${String(uuid.v4())}`,
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
      addPeopleToEvent: (payload: { eventId: string; people: PersonItem[] }) => {
        const participants: ParticipantItem[] = payload.people.map((person) => ({
          id: person.id,
          name: person.name,
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
              id: `payment-${String(uuid.v4())}`,
              eventId: payload.eventId,
              fromId: payload.fromId,
              toId: payload.toId,
              amount: payload.amount,
              source: payload.source,
            }),
          },
        });
      },
    }),
    [dispatch],
  );
}

export function persistEvents(state: EventsState) {
  writeJSON('events', state);
}

// selectors moved to eventsSelectors.ts

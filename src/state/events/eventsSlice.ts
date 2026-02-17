import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventGroupItem } from '@/features/events/types/events';
import { createDefaultEventsState } from '@/state/defaultState';
import {
  AddExpensePayload,
  AddParticipantsPayload,
  CreateEventPayload,
  CreateGroupPayload,
  RegisterPaymentPayload,
  RemoveEventsPayload,
  RemoveExpensesPayload,
  RemoveGroupsPayload,
  RemoveParticipantsPayload,
  RemovePeopleEverywherePayload,
  UpdateEventPayload,
  UpdateExpensePayload,
  UpdateGroupPayload,
} from '@/state/events/eventsActionTypes';

export const eventsSlice = createSlice({
  name: 'events',
  initialState: createDefaultEventsState(),
  reducers: {
    createEvent: (state, action: PayloadAction<CreateEventPayload>) => {
      const now = new Date().toISOString();
      const { id, name, description, currency, date, groupId } = action.payload;
      state.events.unshift({
        id,
        name,
        description,
        currency,
        date: date ?? null,
        groupId,
        createdAt: now,
        updatedAt: now,
        expenses: [],
        participants: [],
      });
    },
    createGroup: (state, action: PayloadAction<CreateGroupPayload>) => {
      const now = new Date().toISOString();
      const { id, name, description } = action.payload;
      state.groups.unshift({ id, name, description, createdAt: now, updatedAt: now });
    },
    updateGroup: (state, action: PayloadAction<UpdateGroupPayload>) => {
      const now = new Date().toISOString();
      const { groupId, name, description } = action.payload;
      state.groups = state.groups.map((group: EventGroupItem) =>
        group.id === groupId
          ? {
              ...group,
              name,
              description,
              updatedAt: now,
            }
          : group,
      );
    },
    updateEvent: (state, action: PayloadAction<UpdateEventPayload>) => {
      const now = new Date().toISOString();
      const { eventId, name, description, currency, date, groupId } = action.payload;
      state.events = state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              name,
              description,
              currency,
              date: date ?? null,
              groupId,
              updatedAt: now,
            }
          : event,
      );
    },
    addExpense: (state, action: PayloadAction<AddExpensePayload>) => {
      const now = new Date().toISOString();
      const { eventId, expense } = action.payload;
      state.events = state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              updatedAt: now,
              expenses: [
                {
                  ...expense,
                  createdAt: now,
                  updatedAt: now,
                },
                ...event.expenses,
              ],
            }
          : event,
      );
      state.paymentsByEvent[eventId] = [];
    },
    updateExpense: (state, action: PayloadAction<UpdateExpensePayload>) => {
      const now = new Date().toISOString();
      const { eventId, expenseId, patch } = action.payload;
      state.events = state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              updatedAt: now,
              expenses: event.expenses.map((expense) =>
                expense.id === expenseId
                  ? {
                      ...expense,
                      title: patch.title,
                      amount: patch.amount,
                      paidBy: patch.paidBy,
                      paidById: patch.paidById,
                      updatedAt: now,
                    }
                  : expense,
              ),
            }
          : event,
      );
      state.paymentsByEvent[eventId] = [];
    },
    addParticipants: (state, action: PayloadAction<AddParticipantsPayload>) => {
      const now = new Date().toISOString();
      const { eventId, participants } = action.payload;
      state.events = state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              updatedAt: now,
              participants: [
                ...event.participants,
                ...participants.filter(
                  (participant) =>
                    !event.participants.some((existing) => existing.id === participant.id),
                ),
              ],
            }
          : event,
      );
      state.paymentsByEvent[eventId] = [];
    },
    registerPayment: (state, action: PayloadAction<RegisterPaymentPayload>) => {
      const now = new Date().toISOString();
      const { eventId, payment } = action.payload;
      const current = state.paymentsByEvent[eventId] ?? [];
      if (current.some((item) => item.id === payment.id)) {
        return;
      }

      state.events = state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              updatedAt: now,
            }
          : event,
      );
      state.paymentsByEvent[eventId] = [...current, payment];
    },
    removeParticipants: (state, action: PayloadAction<RemoveParticipantsPayload>) => {
      const now = new Date().toISOString();
      const { eventId, participantIds } = action.payload;
      if (participantIds.length === 0) {
        return;
      }

      const idsSet = new Set(participantIds);
      state.events = state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              updatedAt: now,
              participants: event.participants.filter((participant) => !idsSet.has(participant.id)),
            }
          : event,
      );
      state.paymentsByEvent[eventId] = [];
    },
    removePeopleEverywhere: (state, action: PayloadAction<RemovePeopleEverywherePayload>) => {
      const now = new Date().toISOString();
      const { personIds } = action.payload;
      if (personIds.length === 0) {
        return;
      }

      const idsSet = new Set(personIds);
      const deletedNames = new Set(
        state.events.flatMap((event) =>
          event.participants
            .filter((participant) => idsSet.has(participant.id))
            .map((participant) => participant.name.toLowerCase()),
        ),
      );

      state.events = state.events.map((event) => ({
        ...event,
        updatedAt: now,
        participants: event.participants.filter((participant) => !idsSet.has(participant.id)),
        expenses: event.expenses.filter((expense) => {
          if (expense.paidById && idsSet.has(expense.paidById)) {
            return false;
          }
          return !deletedNames.has(expense.paidBy.trim().toLowerCase());
        }),
      }));

      state.paymentsByEvent = Object.fromEntries(
        Object.entries(state.paymentsByEvent).map(([eventId, payments]) => [
          eventId,
          payments.filter((payment) => !idsSet.has(payment.fromId) && !idsSet.has(payment.toId)),
        ]),
      );
    },
    removeEvents: (state, action: PayloadAction<RemoveEventsPayload>) => {
      const idsSet = new Set(action.payload.eventIds);
      state.events = state.events.filter((event) => !idsSet.has(event.id));
      state.paymentsByEvent = Object.fromEntries(
        Object.entries(state.paymentsByEvent).filter(([eventId]) => !idsSet.has(eventId)),
      );
    },
    removeGroups: (state, action: PayloadAction<RemoveGroupsPayload>) => {
      if (action.payload.groupIds.length === 0) {
        return;
      }
      const groupIdsSet = new Set(action.payload.groupIds);
      state.groups = state.groups.filter((group) => !groupIdsSet.has(group.id));
      const removedEventIds = new Set(
        state.events
          .filter((event) => event.groupId && groupIdsSet.has(event.groupId))
          .map((event) => event.id),
      );
      state.events = state.events.filter((event) => !removedEventIds.has(event.id));
      state.paymentsByEvent = Object.fromEntries(
        Object.entries(state.paymentsByEvent).filter(([eventId]) => !removedEventIds.has(eventId)),
      );
    },
    removeExpenses: (state, action: PayloadAction<RemoveExpensesPayload>) => {
      const now = new Date().toISOString();
      const { eventId, expenseIds } = action.payload;
      if (expenseIds.length === 0) {
        return;
      }
      const idsSet = new Set(expenseIds);

      state.events = state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              updatedAt: now,
              expenses: event.expenses.filter((expense) => !idsSet.has(expense.id)),
            }
          : event,
      );
      state.paymentsByEvent[eventId] = [];
    },
  },
});

export const eventsActions = eventsSlice.actions;

import { useMemo } from 'react';
import { ParticipantItem } from '@/features/events/types/events';
import { PersonItem } from '@/features/people/types/people';
import { selectEventsState } from '@/state/events/eventsSelectors';
import { persistEvents } from '@/state/events/eventsStateInit';
import { eventsActions } from '@/state/events/eventsSlice';
import { createEventPayment, PaymentSource } from '@/state/events/paymentsModel';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { createEntityId } from '@/shared/utils/id';
import { normalizeOptionalText } from '@/shared/utils/validation';

export function useEventsState() {
  return useAppSelector(selectEventsState);
}

export function useEventsActions() {
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      createEvent: (payload: { name: string; description?: string; currency?: string; date?: string | null; groupId?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Event name is required.');
        }

        dispatch(
          eventsActions.createEvent({
            id: createEntityId('event'),
            name: trimmedName,
            description: normalizeOptionalText(payload.description),
            currency: payload.currency,
            date: payload.date ?? null,
            groupId: payload.groupId,
          }),
        );
      },
      createGroup: (payload: { name: string; description?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Group name is required.');
        }

        dispatch(
          eventsActions.createGroup({
            id: createEntityId('group'),
            name: trimmedName,
            description: normalizeOptionalText(payload.description),
          }),
        );
      },
      updateGroup: (payload: { groupId: string; name: string; description?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Group name is required.');
        }

        dispatch(
          eventsActions.updateGroup({
            groupId: payload.groupId,
            name: trimmedName,
            description: normalizeOptionalText(payload.description),
          }),
        );
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

        dispatch(
          eventsActions.updateEvent({
            eventId: payload.eventId,
            name: trimmedName,
            description: normalizeOptionalText(payload.description),
            currency: payload.currency,
            date: payload.date ?? null,
            groupId: payload.groupId,
          }),
        );
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

        dispatch(
          eventsActions.addExpense({
            eventId: payload.eventId,
            expense: nextExpense,
          }),
        );
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

        dispatch(
          eventsActions.updateExpense({
            eventId: payload.eventId,
            expenseId: payload.expenseId,
            patch: {
              title: trimmedTitle,
              amount: payload.patch.amount,
              paidBy: payload.patch.paidBy,
              paidById: payload.patch.paidById,
            },
          }),
        );
      },
      addPeopleToEvent: (payload: { eventId: string; people: PersonItem[] }) => {
        const participants: ParticipantItem[] = payload.people.map((person) => ({
          id: person.id,
          name: person.name,
          phone: person.phone,
          email: person.email,
          isMe: person.isMe,
        }));

        dispatch(
          eventsActions.addParticipants({
            eventId: payload.eventId,
            participants,
          }),
        );
      },
      registerPayment: (payload: { eventId: string; fromId: string; toId: string; amount: number; source: PaymentSource }) => {
        dispatch(
          eventsActions.registerPayment({
            eventId: payload.eventId,
            payment: createEventPayment({
              id: createEntityId('payment'),
              eventId: payload.eventId,
              fromId: payload.fromId,
              toId: payload.toId,
              amount: payload.amount,
              source: payload.source,
            }),
          }),
        );
      },
      removeParticipantsFromEvent: (payload: { eventId: string; participantIds: string[] }) => {
        dispatch(eventsActions.removeParticipants(payload));
      },
      removePeopleEverywhere: (payload: { personIds: string[] }) => {
        dispatch(eventsActions.removePeopleEverywhere(payload));
      },
      removeEvents: (payload: { eventIds: string[] }) => {
        dispatch(eventsActions.removeEvents(payload));
      },
      removeGroups: (payload: { groupIds: string[] }) => {
        dispatch(eventsActions.removeGroups(payload));
      },
      removeExpenses: (payload: { eventId: string; expenseIds: string[] }) => {
        dispatch(eventsActions.removeExpenses(payload));
      },
    }),
    [dispatch],
  );
}

export { persistEvents };

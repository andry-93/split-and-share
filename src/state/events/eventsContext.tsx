import { useMemo } from 'react';
import { ParticipantItem } from '@/features/events/types/events';
import { PersonItem } from '@/features/people/types/people';
import {
  selectDetailedDebts,
  selectEffectiveRawDebts,
  selectEventById,
  selectEventsState,
  selectRawDebts,
  selectSimplifiedDebts,
} from '@/state/events/eventsSelectors';
import { persistEvents } from '@/state/events/eventsStateInit';
import { eventsActions } from '@/state/events/eventsSlice';
import { createEventPayment, PaymentSource } from '@/state/events/paymentsModel';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { createEntityId } from '@/shared/utils/id';
import { normalizeOptionalText } from '@/shared/utils/validation';
import { validatePaymentAmount } from '@/domain/finance/invariants';
import i18n from '@/shared/i18n';

export function useEventsState() {
  return useAppSelector(selectEventsState);
}

export function useEventsActions() {
  const dispatch = useAppDispatch();
  const eventsState = useAppSelector(selectEventsState);

  return useMemo(
    () => ({
      createEvent: (payload: { name: string; description?: string; currency?: string; date?: string | null; groupId?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error(i18n.t('events.eventNameRequired'));
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
          throw new Error(i18n.t('events.groupNameRequired'));
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
          throw new Error(i18n.t('events.groupNameRequired'));
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
          throw new Error(i18n.t('events.eventNameRequired'));
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
      addExpense: (payload: {
        eventId: string;
        expense: { title: string; amountMinor: number; paidBy: string; paidById?: string; splitBetweenIds: string[] };
      }) => {
        const trimmedTitle = payload.expense.title.trim();
        if (!trimmedTitle) {
          throw new Error(i18n.t('events.expenseTitleRequired'));
        }

        if (!Number.isFinite(payload.expense.amountMinor) || payload.expense.amountMinor <= 0) {
          throw new Error(i18n.t('events.amountPositiveRequired'));
        }

        const normalizedSplitBetweenIds = Array.from(
          new Set(payload.expense.splitBetweenIds ?? []),
        ).filter(Boolean);
        if (normalizedSplitBetweenIds.length === 0) {
          throw new Error(i18n.t('events.splitBetweenRequired'));
        }

        const nextExpense = {
          id: createEntityId('expense'),
          title: trimmedTitle,
          amountMinor: payload.expense.amountMinor,
          paidBy: payload.expense.paidBy,
          paidById: payload.expense.paidById,
          splitBetweenIds: normalizedSplitBetweenIds,
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
        patch: { title: string; amountMinor: number; paidBy: string; paidById?: string; splitBetweenIds: string[] };
      }) => {
        const trimmedTitle = payload.patch.title.trim();
        if (!trimmedTitle) {
          throw new Error(i18n.t('events.expenseTitleRequired'));
        }

        if (!Number.isFinite(payload.patch.amountMinor) || payload.patch.amountMinor <= 0) {
          throw new Error(i18n.t('events.amountPositiveRequired'));
        }

        const normalizedSplitBetweenIds = Array.from(
          new Set(payload.patch.splitBetweenIds ?? []),
        ).filter(Boolean);
        if (normalizedSplitBetweenIds.length === 0) {
          throw new Error(i18n.t('events.splitBetweenRequired'));
        }

        dispatch(
          eventsActions.updateExpense({
            eventId: payload.eventId,
            expenseId: payload.expenseId,
            patch: {
              title: trimmedTitle,
              amountMinor: payload.patch.amountMinor,
              paidBy: payload.patch.paidBy,
              paidById: payload.patch.paidById,
              splitBetweenIds: normalizedSplitBetweenIds,
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
      registerPayment: (payload: { eventId: string; fromId: string; toId: string; amountMinor: number; source: PaymentSource }) => {
        const event = selectEventById(eventsState, payload.eventId);
        if (!event) {
          return;
        }

        const rawDebts = selectRawDebts(event);
        const currentPayments = eventsState.paymentsByEvent[payload.eventId] ?? [];
        const effectiveRawDebts = selectEffectiveRawDebts(rawDebts, currentPayments);
        const sourceDebts =
          payload.source === 'detailed'
            ? selectDetailedDebts(effectiveRawDebts)
            : selectSimplifiedDebts(effectiveRawDebts);
        const isPool = payload.toId.startsWith('pool-') || event.pools?.some((p) => p.id === payload.toId);

        if (!isPool) {
          const targetDebt = sourceDebts.find(
            (debt) => debt.from.id === payload.fromId && debt.to.id === payload.toId,
          );
          if (!targetDebt) {
            return;
          }

          const validation = validatePaymentAmount(payload.amountMinor, targetDebt.amountMinor);
          if (!validation.valid) {
            return;
          }
        }

        dispatch(
          eventsActions.registerPayment({
            eventId: payload.eventId,
            payment: createEventPayment({
              id: createEntityId('payment'),
              eventId: payload.eventId,
              fromId: payload.fromId,
              toId: payload.toId,
              amountMinor: payload.amountMinor,
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
      addPool: (payload: { eventId: string; name: string; id?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error(i18n.t('events.pools.poolNameRequired'));
        }
        const poolId = payload.id ?? createEntityId('pool');
        dispatch(
          eventsActions.addPool({
            eventId: payload.eventId,
            pool: {
              id: poolId,
              name: trimmedName,
            },
          }),
        );
        return poolId;
      },
      updatePool: (payload: { eventId: string; poolId: string; name: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error(i18n.t('events.pools.poolNameRequired'));
        }
        dispatch(
          eventsActions.updatePool({
            eventId: payload.eventId,
            poolId: payload.poolId,
            name: trimmedName,
          }),
        );
      },
      removePool: (payload: { eventId: string; poolIds: string[] }) => {
        dispatch(eventsActions.removePool(payload));
      },
      resetEvents: () => {
        dispatch(eventsActions.resetEvents());
      },
    }),
    [dispatch, eventsState],
  );
}

export { persistEvents };

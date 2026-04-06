import { createSelector } from '@reduxjs/toolkit';
import {
  applyPayments,
  computeDetailedDebts,
  computeRawDebts,
  computeSimplifiedDebts,
  DebtMinor,
  toDebtMinor,
} from '@/domain/finance/debtEngine';
import { fromMinorUnits, sumMinorUnits, toMinorUnits } from '@/domain/finance/minorUnits';
import { EventGroupItem, EventItem, ExpenseItem, ParticipantItem } from '@/features/events/types/events';
import { EventPayment } from '@/state/events/paymentsModel';
import { EventsState } from '@/state/events/eventsTypes';
import { RootState } from '@/state/store';

export type RawDebt = {
  id: string;
  from: ParticipantItem;
  to: ParticipantItem;
  amountMinor: number;
};

export type SimplifiedDebt = {
  id: string;
  from: ParticipantItem;
  to: ParticipantItem;
  amountMinor: number;
};

export type PaymentEntry = EventPayment;

export const selectEventsState = (state: RootState): EventsState => state.events;
export const selectEvents = (state: RootState): EventItem[] => state.events.events;
export const selectEventGroups = (state: RootState): EventGroupItem[] => state.events.groups;
export const selectPaymentsByEvent = (state: RootState): Record<string, EventPayment[]> =>
  state.events.paymentsByEvent;

export function selectEventById(state: EventsState, eventId: string): EventItem | undefined {
  return state.events.find((event) => event.id === eventId);
}

export function selectPayments(state: EventsState, eventId: string) {
  return state.paymentsByEvent[eventId] ?? [];
}

function createParticipantMap(participants: ParticipantItem[]) {
  return new Map(participants.map((participant) => [participant.id, participant]));
}

function createParticipantMapFromDebts(rawDebts: RawDebt[]) {
  const participantsById = new Map<string, ParticipantItem>();
  rawDebts.forEach((debt) => {
    participantsById.set(debt.from.id, debt.from);
    participantsById.set(debt.to.id, debt.to);
  });
  return participantsById;
}

function mapDebtMinorToRawDebts(
  debts: DebtMinor[],
  participantsById: Map<string, ParticipantItem>,
): RawDebt[] {
  return debts
    .map((debt) => {
      const from = participantsById.get(debt.fromId);
      const to = participantsById.get(debt.toId);
      if (!from || !to) {
        return null;
      }

      return {
        id: debt.id,
        from,
        to,
        amountMinor: debt.amountMinor,
      } satisfies RawDebt;
    })
    .filter((debt): debt is RawDebt => debt !== null);
}

function toDebtMinorList(rawDebts: RawDebt[]): DebtMinor[] {
  return toDebtMinor(
    rawDebts.map((debt) => ({
      id: debt.id,
      from: { id: debt.from.id },
      to: { id: debt.to.id },
      amountMinor: debt.amountMinor,
    })),
  );
}

export function selectRawDebts(event?: EventItem): RawDebt[] {
  if (!event || event.participants.length === 0 || event.expenses.length === 0) {
    return [];
  }

  const participantById = createParticipantMap(event.participants);
  (event.pools ?? []).forEach((pool) => {
    participantById.set(pool.id, { id: pool.id, name: pool.name });
  });

  const rawDebts = computeRawDebts({
    eventId: event.id,
    participants: [
      ...event.participants,
      ...(event.pools ?? []).map((pool) => ({ id: pool.id, name: pool.name })),
    ],
    expenses: event.expenses,
  });

  return mapDebtMinorToRawDebts(rawDebts, participantById);
}

export function selectEffectiveRawDebts(rawDebts: RawDebt[], payments: PaymentEntry[]): RawDebt[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const participantsById = createParticipantMapFromDebts(rawDebts);
  const effectiveDebts = applyPayments(toDebtMinorList(rawDebts), payments);
  return mapDebtMinorToRawDebts(effectiveDebts, participantsById);
}

export function selectDetailedDebts(rawDebts: RawDebt[]): RawDebt[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const participantsById = createParticipantMapFromDebts(rawDebts);
  const detailedDebts = computeDetailedDebts(toDebtMinorList(rawDebts));

  return mapDebtMinorToRawDebts(detailedDebts, participantsById).sort((left, right) => {
    const byFrom = left.from.name.localeCompare(right.from.name);
    if (byFrom !== 0) {
      return byFrom;
    }

    return left.to.name.localeCompare(right.to.name);
  });
}

export function selectSimplifiedDebts(rawDebts: RawDebt[]): SimplifiedDebt[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const participantsById = createParticipantMapFromDebts(rawDebts);
  const simplifiedDebts = computeSimplifiedDebts(toDebtMinorList(rawDebts));

  return mapDebtMinorToRawDebts(simplifiedDebts, participantsById);
}

export function selectTotalAmount(event?: EventItem) {
  if (!event) {
    return 0;
  }

  return fromMinorUnits(sumMinorUnits(event.expenses.map((expense) => expense.amountMinor)));
}

export function selectEventStats(event?: EventItem) {
  return {
    totalAmount: selectTotalAmount(event),
    participantsCount: selectParticipantsCount(event),
    expensesCount: selectExpensesCount(event),
  };
}

export function selectParticipantsCount(event?: EventItem) {
  return event ? event.participants.length : 0;
}

export function selectExpensesCount(event?: EventItem) {
  return event ? event.expenses.length : 0;
}

export function selectOutstandingTotal(rawDebts: RawDebt[]) {
  return fromMinorUnits(sumMinorUnits(rawDebts.map((debt) => debt.amountMinor)));
}

export function selectOutstandingPeopleCount(rawDebts: RawDebt[]) {
  if (rawDebts.length === 0) {
    return 0;
  }

  const participants = new Set<string>();
  rawDebts.forEach((debt) => {
    participants.add(debt.from.id);
    participants.add(debt.to.id);
  });
  return participants.size;
}

export function selectOutstandingTransfersCount(rawDebts: RawDebt[]) {
  return selectDetailedDebts(rawDebts).length;
}

function toTimestamp(value?: string) {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function selectEventsSortedByUpdatedAt(events: EventItem[]) {
  return [...events].sort(
    (a, b) =>
      toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
}

export function selectGroupsSortedByUpdatedAt(groups: EventGroupItem[]) {
  return [...groups].sort(
    (a, b) =>
      toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
}

export function selectExpensesSortedByUpdatedAt(expenses: ExpenseItem[]) {
  return [...expenses].sort(
    (a, b) =>
      toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt) ||
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );
}

export function selectPoolBalanceMap(event: EventItem, payments: PaymentEntry[]) {
  const pools = event.pools ?? [];
  const balanceByIdMinor = new Map<string, number>();
  pools.forEach((pool) => {
    balanceByIdMinor.set(pool.id, 0);
  });

  // 1. Add Cash In from payments
  payments.forEach((payment) => {
    if (balanceByIdMinor.has(payment.toId)) {
      balanceByIdMinor.set(
        payment.toId,
        (balanceByIdMinor.get(payment.toId) ?? 0) + Math.round(payment.amountMinor),
      );
    }
    // 2. Subtract Cash Out from payments (e.g. pool paying a person)
    if (balanceByIdMinor.has(payment.fromId)) {
      balanceByIdMinor.set(
        payment.fromId,
        (balanceByIdMinor.get(payment.fromId) ?? 0) - Math.round(payment.amountMinor),
      );
    }
  });

  // 3. Subtract Cash Out from expenses (pool paying for things)
  event.expenses.forEach((expense) => {
    if (expense.paidById && balanceByIdMinor.has(expense.paidById)) {
      balanceByIdMinor.set(
        expense.paidById,
        (balanceByIdMinor.get(expense.paidById) ?? 0) - Math.round(expense.amountMinor),
      );
    }
  });

  const balanceById = new Map<string, number>();
  balanceByIdMinor.forEach((value, key) => {
    balanceById.set(key, fromMinorUnits(value));
  });
  return balanceById;
}

export function createEventDetailsSelectors() {
  const selectEventStatsMemo = createSelector(
    [(event: EventItem) => event],
    (event) => selectEventStats(event),
  );
  const selectRawDebtsMemo = createSelector(
    [(event: EventItem) => event],
    (event) => selectRawDebts(event),
  );

  const selectPaymentsMemo = createSelector(
    [(eventsState: EventsState) => eventsState, (_eventsState: EventsState, eventId: string) => eventId],
    (eventsState, eventId) => selectPayments(eventsState, eventId),
  );

  const selectEffectiveRawDebtsMemo = createSelector(
    [(rawDebts: RawDebt[]) => rawDebts, (_rawDebts: RawDebt[], payments: PaymentEntry[]) => payments],
    (rawDebts, payments) => selectEffectiveRawDebts(rawDebts, payments),
  );

  const selectDetailedDebtsMemo = createSelector([(rawDebts: RawDebt[]) => rawDebts], (rawDebts) =>
    selectDetailedDebts(rawDebts),
  );

  const selectSimplifiedDebtsMemo = createSelector([(rawDebts: RawDebt[]) => rawDebts], (rawDebts) =>
    selectSimplifiedDebts(rawDebts),
  );

  const selectOutstandingTotalMemo = createSelector(
    [(rawDebts: RawDebt[]) => rawDebts],
    (rawDebts) => selectOutstandingTotal(rawDebts),
  );

  const selectOutstandingPeopleCountMemo = createSelector(
    [(rawDebts: RawDebt[]) => rawDebts],
    (rawDebts) => selectOutstandingPeopleCount(rawDebts),
  );

  const selectOutstandingTransfersCountMemo = createSelector(
    [(rawDebts: RawDebt[]) => rawDebts],
    (rawDebts) => selectOutstandingTransfersCount(rawDebts),
  );

  const selectParticipantBalanceMapMemo = createSelector(
    [(participants: ParticipantItem[]) => participants, (_participants: ParticipantItem[], rawDebts: RawDebt[]) => rawDebts],
    (participants, rawDebts) => {
      const balanceByIdMinor = new Map<string, number>();
      participants.forEach((participant) => {
        balanceByIdMinor.set(participant.id, 0);
      });
      rawDebts.forEach((debt) => {
        const debtMinor = Math.round(debt.amountMinor);
        balanceByIdMinor.set(debt.from.id, (balanceByIdMinor.get(debt.from.id) ?? 0) - debtMinor);
        balanceByIdMinor.set(debt.to.id, (balanceByIdMinor.get(debt.to.id) ?? 0) + debtMinor);
      });

      const balanceById = new Map<string, number>();
      balanceByIdMinor.forEach((value, key) => {
        balanceById.set(key, fromMinorUnits(value));
      });
      return balanceById;
    },
  );

  const selectPoolBalanceMapMemo = createSelector(
    [(event: EventItem) => event, (_event: EventItem, payments: PaymentEntry[]) => payments],
    (event, payments) => selectPoolBalanceMap(event, payments),
  );

  return {
    selectEventStatsMemo,
    selectRawDebtsMemo,
    selectPaymentsMemo,
    selectEffectiveRawDebtsMemo,
    selectDetailedDebtsMemo,
    selectSimplifiedDebtsMemo,
    selectOutstandingTotalMemo,
    selectOutstandingPeopleCountMemo,
    selectOutstandingTransfersCountMemo,
    selectParticipantBalanceMapMemo,
    selectPoolBalanceMapMemo,
  };
}

export function createEventsListSelectors() {
  const selectGroupsByIdMemo = createSelector([(groups: EventGroupItem[]) => groups], (groups) => {
    return new Map(groups.map((group) => [group.id, group]));
  });

  const selectCurrentGroupMemo = createSelector(
    [(groupsById: Map<string, EventGroupItem>) => groupsById, (_groupsById: Map<string, EventGroupItem>, groupId?: string) => groupId],
    (groupsById, groupId) => (groupId ? groupsById.get(groupId) : undefined),
  );

  const selectEffectiveGroupIdMemo = createSelector(
    [(currentGroup?: EventGroupItem) => currentGroup, (_currentGroup: EventGroupItem | undefined, groupId?: string) => groupId],
    (currentGroup, groupId) => (currentGroup ? groupId : undefined),
  );

  const selectFilteredEventsMemo = createSelector(
    [
      (events: EventItem[]) => events,
      (_events: EventItem[], effectiveGroupId: string | undefined) => effectiveGroupId,
      (_events: EventItem[], _effectiveGroupId: string | undefined, groupsById: Map<string, EventGroupItem>) =>
        groupsById,
      (_events: EventItem[], _effectiveGroupId: string | undefined, _groupsById: Map<string, EventGroupItem>, query: string) =>
        query,
    ],
    (events, effectiveGroupId, groupsById, query) => {
      const normalized = query.trim().toLowerCase();
      const baseEvents = events.filter((event) => {
        if (effectiveGroupId) {
          return event.groupId === effectiveGroupId;
        }

        if (!event.groupId) {
          return true;
        }

        return !groupsById.has(event.groupId);
      });

      const matches = !normalized
        ? baseEvents
        : baseEvents.filter((event) => event.name.toLowerCase().includes(normalized));

      return selectEventsSortedByUpdatedAt(matches);
    },
  );

  const selectFilteredGroupsMemo = createSelector(
    [
      (groups: EventGroupItem[]) => groups,
      (_groups: EventGroupItem[], effectiveGroupId: string | undefined) => effectiveGroupId,
      (_groups: EventGroupItem[], _effectiveGroupId: string | undefined, query: string) => query,
      (_groups: EventGroupItem[], _effectiveGroupId: string | undefined, _query: string, events: EventItem[]) =>
        events,
    ],
    (groups, effectiveGroupId, query, events) => {
      if (effectiveGroupId) {
        return [];
      }

      const normalized = query.trim().toLowerCase();
      const matches = !normalized
        ? groups
        : groups.filter((group) => {
            if (group.name.toLowerCase().includes(normalized)) {
              return true;
            }

            return events.some(
              (event) => event.groupId === group.id && event.name.toLowerCase().includes(normalized),
            );
          });

      return selectGroupsSortedByUpdatedAt(matches);
    },
  );

  const selectEventsCountByGroupMemo = createSelector([(events: EventItem[]) => events], (events) => {
    const counts = new Map<string, number>();
    events.forEach((event) => {
      if (!event.groupId) {
        return;
      }
      counts.set(event.groupId, (counts.get(event.groupId) ?? 0) + 1);
    });
    return counts;
  });

  return {
    selectGroupsByIdMemo,
    selectCurrentGroupMemo,
    selectEffectiveGroupIdMemo,
    selectFilteredEventsMemo,
    selectFilteredGroupsMemo,
    selectEventsCountByGroupMemo,
  };
}

export function createEventCardSelectors() {
  const selectTotalMemo = createSelector([(event: EventItem) => event], (event) => selectTotalAmount(event));
  const selectRawDebtsMemo = createSelector([(event: EventItem) => event], (event) => selectRawDebts(event));
  const selectEffectiveRawDebtsMemo = createSelector(
    [(rawDebts: RawDebt[]) => rawDebts, (_rawDebts: RawDebt[], payments: PaymentEntry[]) => payments],
    (rawDebts, payments) => selectEffectiveRawDebts(rawDebts, payments),
  );

  return {
    selectTotalMemo,
    selectRawDebtsMemo,
    selectEffectiveRawDebtsMemo,
  };
}

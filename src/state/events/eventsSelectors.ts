import { EventGroupItem, EventItem, ExpenseItem, ParticipantItem } from '@/features/events/types/events';
import { fromMinorUnits, toMinorUnits } from '@/shared/utils/currency';
import { EventsState } from '@/state/events/eventsTypes';
import { EventPayment } from '@/state/events/paymentsModel';

export type RawDebt = {
  id: string;
  from: ParticipantItem;
  to: ParticipantItem;
  amount: number;
};

export type SimplifiedDebt = {
  id: string;
  from: ParticipantItem;
  to: ParticipantItem;
  amount: number;
};

export type PaymentEntry = EventPayment;

export function selectEventById(state: EventsState, eventId: string): EventItem | undefined {
  return state.events.find((event) => event.id === eventId);
}

export function selectPayments(state: EventsState, eventId: string) {
  return state.paymentsByEvent[eventId] ?? [];
}

export function selectRawDebts(event?: EventItem): RawDebt[] {
  if (!event || event.participants.length === 0 || event.expenses.length === 0) {
    return [];
  }

  return event.expenses.flatMap((expense) => {
    const payer = expense.paidById
      ? event.participants.find((participant) => participant.id === expense.paidById)
      : event.participants.find((participant) => participant.name === expense.paidBy);
    if (!payer) {
      return [];
    }

    const participantsCount = event.participants.length;
    const totalMinor = toMinorUnits(expense.amount);
    const baseShareMinor = Math.floor(totalMinor / participantsCount);
    const remainderMinor = totalMinor % participantsCount;

    return event.participants
      .filter((participant) => participant.id !== payer.id)
      .map((participant) => {
        const participantIndex = event.participants.findIndex((item) => item.id === participant.id);
        const shareMinor = baseShareMinor + (participantIndex >= 0 && participantIndex < remainderMinor ? 1 : 0);
        return {
          id: `${expense.id}-${participant.id}-${payer.id}`,
          from: participant,
          to: payer,
          amount: fromMinorUnits(shareMinor),
        };
      })
      .filter((debt) => debt.amount > 0);
  });
}

export function selectSimplifiedDebts(rawDebts: RawDebt[]): SimplifiedDebt[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const balances = new Map<string, { participant: ParticipantItem; amountMinor: number }>();
  rawDebts.forEach((debt) => {
    const fromEntry = balances.get(debt.from.id) ?? { participant: debt.from, amountMinor: 0 };
    const toEntry = balances.get(debt.to.id) ?? { participant: debt.to, amountMinor: 0 };
    const debtMinor = toMinorUnits(debt.amount);

    fromEntry.amountMinor -= debtMinor;
    toEntry.amountMinor += debtMinor;

    balances.set(debt.from.id, fromEntry);
    balances.set(debt.to.id, toEntry);
  });

  const creditors = Array.from(balances.values())
    .filter((entry) => entry.amountMinor > 0)
    .map((entry) => ({ ...entry }));
  const debtors = Array.from(balances.values())
    .filter((entry) => entry.amountMinor < 0)
    .map((entry) => ({ ...entry, amountMinor: Math.abs(entry.amountMinor) }));

  const transfers: SimplifiedDebt[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountMinor = Math.min(debtor.amountMinor, creditor.amountMinor);

    transfers.push({
      id: `${debtor.participant.id}-${creditor.participant.id}-${debtorIndex}-${creditorIndex}`,
      from: debtor.participant,
      to: creditor.participant,
      amount: fromMinorUnits(amountMinor),
    });

    debtor.amountMinor -= amountMinor;
    creditor.amountMinor -= amountMinor;

    if (debtor.amountMinor <= 0) {
      debtorIndex += 1;
    }
    if (creditor.amountMinor <= 0) {
      creditorIndex += 1;
    }
  }

  return transfers;
}

export function selectEffectiveRawDebts(rawDebts: RawDebt[], payments: PaymentEntry[]): RawDebt[] {
  if (rawDebts.length === 0) {
    return [];
  }

  if (payments.length === 0) {
    return rawDebts;
  }

  const detailedPayments = payments.filter((payment) => payment.source === 'detailed');
  const simplifiedPayments = payments.filter((payment) => payment.source === 'simplified');

  const participantsById = new Map<string, ParticipantItem>();
  rawDebts.forEach((debt) => {
    participantsById.set(debt.from.id, debt.from);
    participantsById.set(debt.to.id, debt.to);
  });

  const pairAmountsMinor = new Map<string, number>();
  const addDirectedAmount = (fromId: string, toId: string, deltaMinor: number) => {
    const key = `${fromId}|${toId}`;
    pairAmountsMinor.set(key, (pairAmountsMinor.get(key) ?? 0) + deltaMinor);
  };

  rawDebts.forEach((debt) => {
    addDirectedAmount(debt.from.id, debt.to.id, toMinorUnits(debt.amount));
  });

  detailedPayments.forEach((payment) => {
    // Payment from debtor to creditor decreases debt in the same direction.
    addDirectedAmount(payment.fromId, payment.toId, -toMinorUnits(payment.amount));
  });

  const pairAdjustedDebts: RawDebt[] = [];
  Array.from(pairAmountsMinor.entries()).forEach(([key, amountMinor], index) => {
    if (amountMinor === 0) {
      return;
    }

    const [leftId, rightId] = key.split('|');
    if (!leftId || !rightId) {
      return;
    }

    if (amountMinor > 0) {
      const from = participantsById.get(leftId);
      const to = participantsById.get(rightId);
      if (!from || !to) {
        return;
      }
      pairAdjustedDebts.push({
        id: `effective-${from.id}-${to.id}-${index}`,
        from,
        to,
        amount: fromMinorUnits(amountMinor),
      });
      return;
    }

    const from = participantsById.get(rightId);
    const to = participantsById.get(leftId);
    if (!from || !to) {
      return;
    }
    pairAdjustedDebts.push({
      id: `effective-${from.id}-${to.id}-${index}`,
      from,
      to,
      amount: fromMinorUnits(Math.abs(amountMinor)),
    });
  });

  if (simplifiedPayments.length === 0) {
    return pairAdjustedDebts;
  }

  const paymentCompensation = simplifiedPayments.map((payment) => {
    const from = participantsById.get(payment.fromId);
    const to = participantsById.get(payment.toId);
    if (!from || !to) {
      return null;
    }

    // Reverse direction compensates already paid transfer.
    return {
      id: `payment-${payment.id}`,
      from: to,
      to: from,
      amount: payment.amount,
    } satisfies RawDebt;
  });

  const merged = pairAdjustedDebts.concat(
    paymentCompensation.filter((item): item is RawDebt => item !== null),
  );
  if (merged.length === 0) {
    return [];
  }

  const balances = new Map<string, { participant: ParticipantItem; amountMinor: number }>();
  merged.forEach((debt) => {
    const fromEntry = balances.get(debt.from.id) ?? { participant: debt.from, amountMinor: 0 };
    const toEntry = balances.get(debt.to.id) ?? { participant: debt.to, amountMinor: 0 };
    const debtMinor = toMinorUnits(debt.amount);

    fromEntry.amountMinor -= debtMinor;
    toEntry.amountMinor += debtMinor;

    balances.set(debt.from.id, fromEntry);
    balances.set(debt.to.id, toEntry);
  });

  const creditors = Array.from(balances.values())
    .filter((entry) => entry.amountMinor > 0)
    .map((entry) => ({ ...entry }));
  const debtors = Array.from(balances.values())
    .filter((entry) => entry.amountMinor < 0)
    .map((entry) => ({ ...entry, amountMinor: Math.abs(entry.amountMinor) }));

  const result: RawDebt[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountMinor = Math.min(debtor.amountMinor, creditor.amountMinor);

    result.push({
      id: `effective-${debtor.participant.id}-${creditor.participant.id}-${debtorIndex}-${creditorIndex}`,
      from: debtor.participant,
      to: creditor.participant,
      amount: fromMinorUnits(amountMinor),
    });

    debtor.amountMinor -= amountMinor;
    creditor.amountMinor -= amountMinor;

    if (debtor.amountMinor <= 0) {
      debtorIndex += 1;
    }
    if (creditor.amountMinor <= 0) {
      creditorIndex += 1;
    }
  }

  return result;
}

export function selectDetailedDebts(rawDebts: RawDebt[]): RawDebt[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const pairBalances = new Map<
    string,
    { first: ParticipantItem; second: ParticipantItem; firstOwesSecondMinor: number }
  >();

  rawDebts.forEach((debt) => {
    const isFromFirst = debt.from.id.localeCompare(debt.to.id) <= 0;
    const first = isFromFirst ? debt.from : debt.to;
    const second = isFromFirst ? debt.to : debt.from;
    const key = `${first.id}|${second.id}`;

    const current = pairBalances.get(key) ?? {
      first,
      second,
      firstOwesSecondMinor: 0,
    };

    const debtMinor = toMinorUnits(debt.amount);
    current.firstOwesSecondMinor += isFromFirst ? debtMinor : -debtMinor;
    pairBalances.set(key, current);
  });

  return Array.from(pairBalances.values())
    .filter((entry) => Math.abs(entry.firstOwesSecondMinor) > 0)
    .map((entry) => {
      const from = entry.firstOwesSecondMinor > 0 ? entry.first : entry.second;
      const to = entry.firstOwesSecondMinor > 0 ? entry.second : entry.first;

      return {
        id: `${from.id}-${to.id}-detailed`,
        from,
        to,
        amount: fromMinorUnits(Math.abs(entry.firstOwesSecondMinor)),
      };
    })
    .sort((left, right) => {
      const byFrom = left.from.name.localeCompare(right.from.name);
      if (byFrom !== 0) {
        return byFrom;
      }

      return left.to.name.localeCompare(right.to.name);
    });
}

export function selectSimplifiedTotals(simplifiedDebts: SimplifiedDebt[]) {
  const total = simplifiedDebts.reduce((sum, debt) => sum + debt.amount, 0);
  return {
    youOwe: total,
    youAreOwed: total,
  };
}

export function selectTotalAmount(event?: EventItem) {
  if (!event) {
    return 0;
  }

  const totalMinor = event.expenses.reduce((sum, expense) => sum + toMinorUnits(expense.amount), 0);
  return fromMinorUnits(totalMinor);
}

export function selectParticipantsCount(event?: EventItem) {
  return event ? event.participants.length : 0;
}

export function selectExpensesCount(event?: EventItem) {
  return event ? event.expenses.length : 0;
}

export function selectOutstandingTotal(rawDebts: RawDebt[]) {
  const totalMinor = rawDebts.reduce((sum, debt) => sum + toMinorUnits(debt.amount), 0);
  return fromMinorUnits(totalMinor);
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

import { EventItem, ParticipantItem } from '../../features/events/types/events';
import { fromMinorUnits, toMinorUnits } from '../../shared/utils/currency';
import { EventsState } from './eventsTypes';
import { EventPayment } from './paymentsModel';

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

  const paymentCompensation = payments.map((payment) => {
    const from = rawDebts.find((debt) => debt.from.id === payment.fromId)?.from;
    const to = rawDebts.find((debt) => debt.to.id === payment.toId)?.to;
    if (!from || !to) {
      return null;
    }

    // Reverse debt direction to compensate previously owed amounts.
    return {
      id: `payment-${payment.id}`,
      from: to,
      to: from,
      amount: payment.amount,
    } satisfies RawDebt;
  });

  const merged = rawDebts.concat(paymentCompensation.filter((item): item is RawDebt => item !== null));
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

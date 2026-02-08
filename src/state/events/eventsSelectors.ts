import { EventItem, ParticipantItem } from '../../features/events/types/events';
import { EventsState } from './eventsTypes';

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

export function selectEventById(state: EventsState, eventId: string): EventItem | undefined {
  return state.events.find((event) => event.id === eventId);
}

export function selectPaidSimplifiedIds(state: EventsState, eventId: string) {
  return state.paidSimplifiedByEvent[eventId] ?? [];
}

export function selectRawDebts(event?: EventItem): RawDebt[] {
  if (!event || event.participants.length === 0 || event.expenses.length === 0) {
    return [];
  }

  return event.expenses.flatMap((expense) => {
    const payer = event.participants.find((participant) => participant.name === expense.paidBy);
    if (!payer) {
      return [];
    }

    const share = expense.amount / event.participants.length;
    return event.participants
      .filter((participant) => participant.id !== payer.id)
      .map((participant) => ({
        id: `${expense.id}-${participant.id}-${payer.id}`,
        from: participant,
        to: payer,
        amount: share,
      }));
  });
}

export function selectSimplifiedDebts(rawDebts: RawDebt[]): SimplifiedDebt[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const balances = new Map<string, { participant: ParticipantItem; amount: number }>();
  rawDebts.forEach((debt) => {
    const fromEntry = balances.get(debt.from.id) ?? { participant: debt.from, amount: 0 };
    const toEntry = balances.get(debt.to.id) ?? { participant: debt.to, amount: 0 };

    fromEntry.amount -= debt.amount;
    toEntry.amount += debt.amount;

    balances.set(debt.from.id, fromEntry);
    balances.set(debt.to.id, toEntry);
  });

  const creditors = Array.from(balances.values())
    .filter((entry) => entry.amount > 0)
    .map((entry) => ({ ...entry }));
  const debtors = Array.from(balances.values())
    .filter((entry) => entry.amount < 0)
    .map((entry) => ({ ...entry, amount: Math.abs(entry.amount) }));

  const transfers: SimplifiedDebt[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    transfers.push({
      id: `${debtor.participant.id}-${creditor.participant.id}-${debtorIndex}-${creditorIndex}`,
      from: debtor.participant,
      to: creditor.participant,
      amount,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.0001) {
      debtorIndex += 1;
    }
    if (creditor.amount <= 0.0001) {
      creditorIndex += 1;
    }
  }

  return transfers;
}

export function selectDetailedDebts(rawDebts: RawDebt[]): RawDebt[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const pairBalances = new Map<
    string,
    { first: ParticipantItem; second: ParticipantItem; firstOwesSecond: number }
  >();

  rawDebts.forEach((debt) => {
    const isFromFirst = debt.from.id.localeCompare(debt.to.id) <= 0;
    const first = isFromFirst ? debt.from : debt.to;
    const second = isFromFirst ? debt.to : debt.from;
    const key = `${first.id}|${second.id}`;

    const current = pairBalances.get(key) ?? {
      first,
      second,
      firstOwesSecond: 0,
    };

    current.firstOwesSecond += isFromFirst ? debt.amount : -debt.amount;
    pairBalances.set(key, current);
  });

  return Array.from(pairBalances.values())
    .filter((entry) => Math.abs(entry.firstOwesSecond) > 0.0001)
    .map((entry) => {
      const from = entry.firstOwesSecond > 0 ? entry.first : entry.second;
      const to = entry.firstOwesSecond > 0 ? entry.second : entry.first;

      return {
        id: `${from.id}-${to.id}-detailed`,
        from,
        to,
        amount: Math.abs(entry.firstOwesSecond),
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

  return event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function selectParticipantsCount(event?: EventItem) {
  return event ? event.participants.length : 0;
}

export function selectExpensesCount(event?: EventItem) {
  return event ? event.expenses.length : 0;
}

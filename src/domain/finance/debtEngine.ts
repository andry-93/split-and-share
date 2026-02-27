import { sanitizeSplitParticipantIds } from '@/domain/finance/invariants';
import { toMinorUnits } from '@/domain/finance/minorUnits';
import { ExpenseItem, ParticipantItem } from '@/features/events/types/events';
import { EventPayment } from '@/state/events/paymentsModel';

export type DebtMinor = {
  id: string;
  fromId: string;
  toId: string;
  amountMinor: number;
};

type ComputeRawDebtsInput = {
  eventId: string;
  participants: ParticipantItem[];
  expenses: ExpenseItem[];
};

function compactDebts(debts: DebtMinor[]) {
  return debts.filter((debt) => debt.amountMinor > 0);
}

export function computeRawDebts({
  eventId,
  participants,
  expenses,
}: ComputeRawDebtsInput): DebtMinor[] {
  if (participants.length === 0 || expenses.length === 0) {
    return [];
  }

  const participantsById = new Map(participants.map((participant) => [participant.id, participant]));
  const participantIds = participants.map((participant) => participant.id);

  return compactDebts(
    expenses.flatMap((expense) => {
      const payer = expense.paidById
        ? participantsById.get(expense.paidById)
        : participants.find((participant) => participant.name === expense.paidBy);
      if (!payer) {
        return [];
      }

      const splitBetweenIds = sanitizeSplitParticipantIds(expense.splitBetweenIds, participantIds);
      if (splitBetweenIds.length === 0) {
        return [];
      }

      const totalMinor = toMinorUnits(expense.amount);
      const baseShareMinor = Math.floor(totalMinor / splitBetweenIds.length);
      const remainderMinor = totalMinor % splitBetweenIds.length;

      return splitBetweenIds
        .filter((participantId) => participantId !== payer.id)
        .map((participantId) => {
          const index = splitBetweenIds.indexOf(participantId);
          const shareMinor = baseShareMinor + (index < remainderMinor ? 1 : 0);

          return {
            id: `${eventId}-${expense.id}-${participantId}-${payer.id}`,
            fromId: participantId,
            toId: payer.id,
            amountMinor: shareMinor,
          } satisfies DebtMinor;
        });
    }),
  );
}

export function computeDetailedDebts(rawDebts: DebtMinor[]): DebtMinor[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const pairBalances = new Map<string, number>();

  rawDebts.forEach((debt) => {
    const leftId = debt.fromId.localeCompare(debt.toId) <= 0 ? debt.fromId : debt.toId;
    const rightId = leftId === debt.fromId ? debt.toId : debt.fromId;
    const key = `${leftId}|${rightId}`;
    const current = pairBalances.get(key) ?? 0;
    const sign = debt.fromId === leftId ? 1 : -1;
    pairBalances.set(key, current + debt.amountMinor * sign);
  });

  return compactDebts(
    Array.from(pairBalances.entries())
      .map(([key, balance], index) => {
        if (balance === 0) {
          return null;
        }

        const [firstId, secondId] = key.split('|');
        if (!firstId || !secondId) {
          return null;
        }

        return {
          id: `detailed-${index}-${firstId}-${secondId}`,
          fromId: balance > 0 ? firstId : secondId,
          toId: balance > 0 ? secondId : firstId,
          amountMinor: Math.abs(balance),
        } satisfies DebtMinor;
      })
      .filter((debt): debt is DebtMinor => debt !== null),
  );
}

export function computeSimplifiedDebts(rawDebts: DebtMinor[]): DebtMinor[] {
  if (rawDebts.length === 0) {
    return [];
  }

  const balancesByParticipant = new Map<string, number>();

  rawDebts.forEach((debt) => {
    balancesByParticipant.set(debt.fromId, (balancesByParticipant.get(debt.fromId) ?? 0) - debt.amountMinor);
    balancesByParticipant.set(debt.toId, (balancesByParticipant.get(debt.toId) ?? 0) + debt.amountMinor);
  });

  const creditors = Array.from(balancesByParticipant.entries())
    .filter((entry) => entry[1] > 0)
    .map(([id, amountMinor]) => ({ id, amountMinor }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const debtors = Array.from(balancesByParticipant.entries())
    .filter((entry) => entry[1] < 0)
    .map(([id, amountMinor]) => ({ id, amountMinor: Math.abs(amountMinor) }))
    .sort((left, right) => left.id.localeCompare(right.id));

  const result: DebtMinor[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const transferMinor = Math.min(debtor.amountMinor, creditor.amountMinor);

    result.push({
      id: `simplified-${debtor.id}-${creditor.id}-${debtorIndex}-${creditorIndex}`,
      fromId: debtor.id,
      toId: creditor.id,
      amountMinor: transferMinor,
    });

    debtor.amountMinor -= transferMinor;
    creditor.amountMinor -= transferMinor;

    if (debtor.amountMinor <= 0) {
      debtorIndex += 1;
    }
    if (creditor.amountMinor <= 0) {
      creditorIndex += 1;
    }
  }

  return compactDebts(result);
}

export function applyPayments(rawDebts: DebtMinor[], payments: EventPayment[]): DebtMinor[] {
  if (rawDebts.length === 0) {
    return [];
  }
  if (payments.length === 0) {
    return rawDebts;
  }

  const detailedPayments = payments.filter((payment) => payment.source === 'detailed');
  const simplifiedPayments = payments.filter((payment) => payment.source === 'simplified');

  const detailedCompensation = detailedPayments.map((payment, index) => ({
    id: `detailed-payment-${index}-${payment.id}`,
    fromId: payment.toId,
    toId: payment.fromId,
    amountMinor: toMinorUnits(payment.amount),
  }));
  const detailedAdjusted = computeDetailedDebts(rawDebts.concat(detailedCompensation));
  if (simplifiedPayments.length === 0) {
    return detailedAdjusted;
  }

  const withSimplifiedCompensation = detailedAdjusted.concat(
    simplifiedPayments.map((payment, index) => ({
      id: `payment-${index}-${payment.id}`,
      fromId: payment.toId,
      toId: payment.fromId,
      amountMinor: toMinorUnits(payment.amount),
    })),
  );

  return computeSimplifiedDebts(withSimplifiedCompensation);
}

export function toDebtMinor(rawDebts: Array<{ id: string; from: { id: string }; to: { id: string }; amount: number }>): DebtMinor[] {
  return compactDebts(
    rawDebts.map((debt) => ({
      id: debt.id,
      fromId: debt.from.id,
      toId: debt.to.id,
      amountMinor: toMinorUnits(debt.amount),
    })),
  );
}

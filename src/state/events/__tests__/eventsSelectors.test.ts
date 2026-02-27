import { EventItem, ParticipantItem } from '@/features/events/types/events';
import {
  RawDebt,
  selectEventStats,
  selectDetailedDebts,
  selectEffectiveRawDebts,
  selectRawDebts,
  selectSimplifiedDebts,
  selectTotalAmount,
} from '@/state/events/eventsSelectors';
import { EventPayment } from '@/state/events/paymentsModel';

const now = '2025-01-01T00:00:00.000Z';

function participant(id: string, name: string): ParticipantItem {
  return { id, name };
}

function createEvent(participants: ParticipantItem[], splitBetweenIds: string[], amount = 120): EventItem {
  return {
    id: 'event-1',
    name: 'Test event',
    createdAt: now,
    updatedAt: now,
    expenses: [
      {
        id: 'expense-1',
        title: 'Test expense',
        amount,
        paidBy: participants[0]?.name ?? '',
        paidById: participants[0]?.id,
        splitBetweenIds,
        createdAt: now,
        updatedAt: now,
      },
    ],
    participants,
  };
}

function payment(
  id: string,
  fromId: string,
  toId: string,
  amount: number,
  source: EventPayment['source'] = 'detailed',
): EventPayment {
  return {
    id,
    eventId: 'event-1',
    fromId,
    toId,
    amount,
    createdAt: now,
    source,
  };
}

function normalizeDebts(rawDebts: RawDebt[]) {
  return rawDebts
    .map((debt) => ({
      fromId: debt.from.id,
      toId: debt.to.id,
      amount: Number(debt.amount.toFixed(2)),
    }))
    .sort((left, right) =>
      `${left.fromId}-${left.toId}`.localeCompare(`${right.fromId}-${right.toId}`),
    );
}

describe('eventsSelectors financial logic', () => {
  it('calculates raw debts only for selected split participants', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
      participant('p3', 'Charlie'),
      participant('p4', 'Dana'),
    ];

    const event = createEvent(participants, ['p1', 'p2']);
    const rawDebts = selectRawDebts(event);

    expect(normalizeDebts(rawDebts)).toEqual([{ fromId: 'p2', toId: 'p1', amount: 60 }]);
  });

  it('applies partial detailed payments without changing other debts', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
      participant('p3', 'Charlie'),
    ];
    const event = createEvent(participants, ['p1', 'p2', 'p3'], 90);
    const rawDebts = selectRawDebts(event);

    const effective = selectEffectiveRawDebts(rawDebts, [payment('pay-1', 'p2', 'p1', 10, 'detailed')]);

    expect(normalizeDebts(selectDetailedDebts(effective))).toEqual([
      { fromId: 'p2', toId: 'p1', amount: 20 },
      { fromId: 'p3', toId: 'p1', amount: 30 },
    ]);
  });

  it('supports payer excluded from split set', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
      participant('p3', 'Charlie'),
    ];
    const event = createEvent(participants, ['p2', 'p3'], 90);
    const rawDebts = selectRawDebts(event);

    expect(normalizeDebts(rawDebts)).toEqual([
      { fromId: 'p2', toId: 'p1', amount: 45 },
      { fromId: 'p3', toId: 'p1', amount: 45 },
    ]);
  });

  it('applies partial simplified payments and keeps net balances consistent', () => {
    const rawDebts: RawDebt[] = [
      {
        id: 'd-1',
        from: participant('p2', 'Bob'),
        to: participant('p1', 'Alice'),
        amount: 60,
      },
      {
        id: 'd-2',
        from: participant('p3', 'Charlie'),
        to: participant('p1', 'Alice'),
        amount: 30,
      },
    ];

    const effectiveRaw = selectEffectiveRawDebts(rawDebts, [
      payment('pay-1', 'p2', 'p1', 15, 'simplified'),
    ]);
    const simplified = selectSimplifiedDebts(effectiveRaw);

    expect(
      simplified.map((debt) => ({
        fromId: debt.from.id,
        toId: debt.to.id,
        amount: Number(debt.amount.toFixed(2)),
      })),
    ).toEqual(
      expect.arrayContaining([
        { fromId: 'p2', toId: 'p1', amount: 45 },
        { fromId: 'p3', toId: 'p1', amount: 30 },
      ]),
    );
  });

  it('is invariant to payment order', () => {
    const rawDebts: RawDebt[] = [
      {
        id: 'd-1',
        from: participant('p2', 'Bob'),
        to: participant('p1', 'Alice'),
        amount: 100,
      },
    ];
    const ordered = selectEffectiveRawDebts(rawDebts, [
      payment('pay-1', 'p2', 'p1', 10),
      payment('pay-2', 'p2', 'p1', 20),
    ]);
    const reversed = selectEffectiveRawDebts(rawDebts, [
      payment('pay-2', 'p2', 'p1', 20),
      payment('pay-1', 'p2', 'p1', 10),
    ]);

    expect(normalizeDebts(ordered)).toEqual(normalizeDebts(reversed));
    expect(normalizeDebts(ordered)).toEqual([{ fromId: 'p2', toId: 'p1', amount: 70 }]);
  });

  it('handles overpayment by reversing debt direction deterministically', () => {
    const rawDebts: RawDebt[] = [
      {
        id: 'd-1',
        from: participant('p2', 'Bob'),
        to: participant('p1', 'Alice'),
        amount: 50,
      },
    ];
    const effective = selectEffectiveRawDebts(rawDebts, [payment('pay-1', 'p2', 'p1', 80, 'detailed')]);

    expect(normalizeDebts(selectDetailedDebts(effective))).toEqual([
      { fromId: 'p1', toId: 'p2', amount: 30 },
    ]);
  });

  it('handles cent rounding edge cases deterministically', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
      participant('p3', 'Charlie'),
    ];

    const event = createEvent(participants, ['p1', 'p2', 'p3'], 0.02);
    const rawDebts = selectRawDebts(event);

    expect(normalizeDebts(rawDebts)).toEqual([{ fromId: 'p2', toId: 'p1', amount: 0.01 }]);
  });

  it('calculates event totals in stable minor units', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
    ];
    const event = createEvent(participants, ['p1', 'p2'], 0.1);
    event.expenses.push({
      id: 'expense-2',
      title: 'Second',
      amount: 0.2,
      paidBy: participants[0].name,
      paidById: participants[0].id,
      splitBetweenIds: ['p1', 'p2'],
      createdAt: now,
      updatedAt: now,
    });

    expect(selectTotalAmount(event)).toBe(0.3);
    expect(selectEventStats(event).totalAmount).toBe(0.3);
  });
});

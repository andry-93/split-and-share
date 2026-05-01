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
import { fromMinorUnits } from '@/domain/finance/minorUnits';

const now = '2025-01-01T00:00:00.000Z';

function participant(id: string, name: string): ParticipantItem {
  return { id, name };
}

function createEvent(participants: ParticipantItem[], splitBetweenIds: string[], amountMinor = 12000): EventItem {
  return {
    id: 'event-1',
    name: 'Test event',
    createdAt: now,
    updatedAt: now,
    expenses: [
      {
        id: 'expense-1',
        title: 'Test expense',
        amountMinor,
        paidBy: participants[0]?.name ?? '',
        paidById: participants[0]?.id,
        splitBetweenIds,
        createdAt: now,
        updatedAt: now,
      },
    ],
    participants,
    pools: [],
  };
}


function payment(
  id: string,
  fromId: string,
  toId: string,
  amountMinor: number,
  source: EventPayment['source'] = 'detailed',
): EventPayment {
  return {
    id,
    eventId: 'event-1',
    fromId,
    toId,
    amountMinor,
    createdAt: now,
    source,
  };
}

function normalizeDebts(rawDebts: RawDebt[]) {
  return rawDebts
    .map((debt) => ({
      fromId: debt.from.id,
      toId: debt.to.id,
      amountMinor: debt.amountMinor,
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

    expect(normalizeDebts(rawDebts)).toEqual([{ fromId: 'p2', toId: 'p1', amountMinor: 6000 }]);
  });

  it('applies partial detailed payments without changing other debts', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
      participant('p3', 'Charlie'),
    ];
    const event = createEvent(participants, ['p1', 'p2', 'p3'], 9000);
    const rawDebts = selectRawDebts(event);

    const effective = selectEffectiveRawDebts(rawDebts, [payment('pay-1', 'p2', 'p1', 1000, 'detailed')]);

    expect(normalizeDebts(selectDetailedDebts(effective))).toEqual([
      { fromId: 'p2', toId: 'p1', amountMinor: 2000 },
      { fromId: 'p3', toId: 'p1', amountMinor: 3000 },
    ]);
  });

  it('supports payer excluded from split set', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
      participant('p3', 'Charlie'),
    ];
    const event = createEvent(participants, ['p2', 'p3'], 9000);
    const rawDebts = selectRawDebts(event);

    expect(normalizeDebts(rawDebts)).toEqual([
      { fromId: 'p2', toId: 'p1', amountMinor: 4500 },
      { fromId: 'p3', toId: 'p1', amountMinor: 4500 },
    ]);
  });

  it('applies partial simplified payments and keeps net balances consistent', () => {
    const rawDebts: RawDebt[] = [
      {
        id: 'd-1',
        from: participant('p2', 'Bob'),
        to: participant('p1', 'Alice'),
        amountMinor: 6000,
      },
      {
        id: 'd-2',
        from: participant('p3', 'Charlie'),
        to: participant('p1', 'Alice'),
        amountMinor: 3000,
      },
    ];

    const effectiveRaw = selectEffectiveRawDebts(rawDebts, [
      payment('pay-1', 'p2', 'p1', 1500, 'simplified'),
    ]);
    const simplified = selectSimplifiedDebts(effectiveRaw);

    expect(
      simplified.map((debt) => ({
        fromId: debt.from.id,
        toId: debt.to.id,
        amountMinor: debt.amountMinor,
      })),
    ).toEqual(
      expect.arrayContaining([
        { fromId: 'p2', toId: 'p1', amountMinor: 4500 },
        { fromId: 'p3', toId: 'p1', amountMinor: 3000 },
      ]),
    );
  });

  it('is invariant to payment order', () => {
    const rawDebts: RawDebt[] = [
      {
        id: 'd-1',
        from: participant('p2', 'Bob'),
        to: participant('p1', 'Alice'),
        amountMinor: 10000,
      },
    ];
    const ordered = selectEffectiveRawDebts(rawDebts, [
      payment('pay-1', 'p2', 'p1', 1000),
      payment('pay-2', 'p2', 'p1', 2000),
    ]);
    const reversed = selectEffectiveRawDebts(rawDebts, [
      payment('pay-2', 'p2', 'p1', 2000),
      payment('pay-1', 'p2', 'p1', 1000),
    ]);

    expect(normalizeDebts(ordered)).toEqual(normalizeDebts(reversed));
    expect(normalizeDebts(ordered)).toEqual([{ fromId: 'p2', toId: 'p1', amountMinor: 7000 }]);
  });

  it('handles overpayment by reversing debt direction deterministically', () => {
    const rawDebts: RawDebt[] = [
      {
        id: 'd-1',
        from: participant('p2', 'Bob'),
        to: participant('p1', 'Alice'),
        amountMinor: 5000,
      },
    ];
    const effective = selectEffectiveRawDebts(rawDebts, [payment('pay-1', 'p2', 'p1', 8000, 'detailed')]);

    expect(normalizeDebts(selectDetailedDebts(effective))).toEqual([
      { fromId: 'p1', toId: 'p2', amountMinor: 3000 },
    ]);
  });

  it('handles cent rounding edge cases deterministically', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
      participant('p3', 'Charlie'),
    ];

    const event = createEvent(participants, ['p1', 'p2', 'p3'], 2); // 0.02 -> 2 cents
    const rawDebts = selectRawDebts(event);

    expect(normalizeDebts(rawDebts)).toEqual([{ fromId: 'p2', toId: 'p1', amountMinor: 1 }]);
  });

  it('calculates event totals in stable minor units', () => {
    const participants = [
      participant('p1', 'Alice'),
      participant('p2', 'Bob'),
    ];
    const event = createEvent(participants, ['p1', 'p2'], 10); // 0.10 -> 10 cents
    event.expenses.push({
      id: 'expense-2',
      title: 'Second',
      amountMinor: 20, // 0.20 -> 20 cents
      paidBy: participants[0].name,
      paidById: participants[0].id,
      splitBetweenIds: ['p1', 'p2'],
      createdAt: now,
      updatedAt: now,
    });

    expect(selectTotalAmount(event)).toBe(0.3);
    const stats = selectEventStats(event);
    expect(stats.totalAmount).toBe(0.3);
  });
});

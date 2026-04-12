import { eventsActions, eventsSlice } from '@/state/events/eventsSlice';
import { EventsState } from '@/state/events/eventsTypes';

const now = '2026-01-01T00:00:00.000Z';

function createState(): EventsState {
  return {
    events: [
      {
        id: 'event-1',
        name: 'Event',
        createdAt: now,
        updatedAt: now,
        participants: [
          { id: 'p1', name: 'Alice' },
          { id: 'p2', name: 'Bob' },
        ],
        pools: [
          { id: 'pool-1', name: 'Piggy bank', createdAt: now, updatedAt: now },
        ],
        expenses: [
          {
            id: 'expense-1',
            title: 'Dinner',
            amountMinor: 1000,
            paidBy: 'Piggy bank',
            paidById: 'pool-1',
            splitBetweenIds: ['p1', 'p2'],
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
    ],
    groups: [],
    paymentsByEvent: {
      'event-1': [
        {
          id: 'payment-pool',
          eventId: 'event-1',
          fromId: 'p1',
          toId: 'pool-1',
          amountMinor: 5000,
          createdAt: now,
          source: 'pool',
        },
        {
          id: 'payment-detailed',
          eventId: 'event-1',
          fromId: 'p2',
          toId: 'p1',
          amountMinor: 250,
          createdAt: now,
          source: 'detailed',
        },
      ],
    },
  };
}

describe('eventsSlice payment reset behavior', () => {
  it('keeps pool top-ups when editing an expense and resets only debt payments', () => {
    const next = eventsSlice.reducer(
      createState(),
      eventsActions.updateExpense({
        eventId: 'event-1',
        expenseId: 'expense-1',
        patch: {
          title: 'Dinner (edited)',
          amountMinor: 1000,
          paidBy: 'Piggy bank',
          paidById: 'pool-1',
          splitBetweenIds: ['p1'],
        },
      }),
    );

    expect(next.paymentsByEvent['event-1']).toEqual([
      {
        id: 'payment-pool',
        eventId: 'event-1',
        fromId: 'p1',
        toId: 'pool-1',
        amountMinor: 5000,
        createdAt: now,
        source: 'pool',
      },
    ]);
  });
});

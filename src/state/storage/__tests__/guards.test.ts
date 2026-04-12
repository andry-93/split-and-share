import { parseEventsState, parsePeopleState } from '@/state/storage/guards';

describe('storage guards', () => {
  it('keeps empty people list as valid persisted state', () => {
    const parsed = parsePeopleState({ people: [] });
    expect(parsed.people).toEqual([]);
  });

  it('keeps empty events/groups as valid persisted state', () => {
    const parsed = parseEventsState({
      events: [],
      groups: [],
      paymentsByEvent: {},
    });

    expect(parsed.events).toEqual([]);
    expect(parsed.groups).toEqual([]);
    expect(parsed.paymentsByEvent).toEqual({});
  });

  it('sanitizes splitBetweenIds against event participants', () => {
    const parsed = parseEventsState({
      events: [
        {
          id: 'event-1',
          name: 'Event',
          expenses: [
            {
              id: 'expense-1',
              title: 'Dinner',
              amount: 100,
              paidBy: 'Alice',
              paidById: 'p1',
              splitBetweenIds: ['p2', 'unknown', 'p2'],
            },
          ],
          participants: [
            { id: 'p1', name: 'Alice' },
            { id: 'p2', name: 'Bob' },
          ],
        },
      ],
      groups: [],
      paymentsByEvent: {},
    });

    expect(parsed.events[0]?.expenses[0]?.splitBetweenIds).toEqual(['p2']);
  });

  it('keeps empty splitBetweenIds for pool-paid expenses after rehydrate', () => {
    const parsed = parseEventsState({
      events: [
        {
          id: 'event-1',
          name: 'Event',
          expenses: [
            {
              id: 'expense-1',
              title: 'Pool payment',
              amountMinor: 1000,
              paidBy: 'Piggy bank',
              paidById: 'pool-1',
              splitBetweenIds: [],
            },
          ],
          participants: [
            { id: 'p1', name: 'Alice' },
            { id: 'p2', name: 'Bob' },
          ],
          pools: [{ id: 'pool-1', name: 'Piggy bank' }],
        },
      ],
      groups: [],
      paymentsByEvent: {},
    });

    expect(parsed.events[0]?.expenses[0]?.splitBetweenIds).toEqual([]);
  });

  it('keeps pool payments in persisted paymentsByEvent', () => {
    const parsed = parseEventsState({
      events: [],
      groups: [],
      paymentsByEvent: {
        'event-1': [
          {
            id: 'pay-1',
            eventId: 'event-1',
            fromId: 'p1',
            toId: 'pool-1',
            amountMinor: 1000,
            createdAt: '2026-01-01T00:00:00.000Z',
            source: 'pool',
          },
        ],
      },
    });

    expect(parsed.paymentsByEvent['event-1']).toHaveLength(1);
    expect(parsed.paymentsByEvent['event-1'][0]?.source).toBe('pool');
  });
});

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
});


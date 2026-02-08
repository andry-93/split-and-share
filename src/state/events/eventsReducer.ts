import { EventsAction, EventsState } from './eventsTypes';

export function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case 'events/create': {
      const { id, name, description, currency } = action.payload;
      return {
        ...state,
        events: [
          {
            id,
            name,
            description,
            currency,
            expenses: [],
            participants: [],
          },
          ...state.events,
        ],
      };
    }
    case 'events/addExpense': {
      const { eventId, expense } = action.payload;
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                expenses: [expense, ...event.expenses],
              }
            : event,
        ),
        paidSimplifiedByEvent: {
          ...state.paidSimplifiedByEvent,
          [eventId]: [],
        },
      };
    }
    case 'events/addParticipants': {
      const { eventId, participants } = action.payload;
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                participants: [
                  ...event.participants,
                  ...participants.filter(
                    (participant) =>
                      !event.participants.some((existing) => existing.id === participant.id),
                  ),
                ],
              }
            : event,
        ),
      };
    }
    case 'events/markSimplifiedPaid': {
      const { eventId, debtId } = action.payload;
      const current = state.paidSimplifiedByEvent[eventId] ?? [];
      if (current.includes(debtId)) {
        return state;
      }
      return {
        ...state,
        paidSimplifiedByEvent: {
          ...state.paidSimplifiedByEvent,
          [eventId]: [...current, debtId],
        },
      };
    }
    case 'events/resetSimplifiedPaid': {
      const { eventId } = action.payload;
      return {
        ...state,
        paidSimplifiedByEvent: {
          ...state.paidSimplifiedByEvent,
          [eventId]: [],
        },
      };
    }
    default:
      return state;
  }
}

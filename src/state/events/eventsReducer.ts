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
        paymentsByEvent: {
          ...state.paymentsByEvent,
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
        paymentsByEvent: {
          ...state.paymentsByEvent,
          [eventId]: [],
        },
      };
    }
    case 'events/registerPayment': {
      const { eventId, payment } = action.payload;
      const current = state.paymentsByEvent[eventId] ?? [];
      if (current.some((item) => item.id === payment.id)) {
        return state;
      }
      return {
        ...state,
        paymentsByEvent: {
          ...state.paymentsByEvent,
          [eventId]: [...current, payment],
        },
      };
    }
    default:
      return state;
  }
}

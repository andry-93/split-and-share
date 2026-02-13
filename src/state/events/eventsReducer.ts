import { EventsAction, EventsState } from './eventsTypes';

export function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case 'events/create': {
      const { id, name, description, currency, date } = action.payload;
      return {
        ...state,
        events: [
          {
            id,
            name,
            description,
            currency,
            date: date ?? null,
            expenses: [],
            participants: [],
          },
          ...state.events,
        ],
      };
    }
    case 'events/update': {
      const { eventId, name, description, currency, date } = action.payload;
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                name,
                description,
                currency,
                date: date ?? null,
              }
            : event,
        ),
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
    case 'events/updateExpense': {
      const { eventId, expenseId, patch } = action.payload;
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                expenses: event.expenses.map((expense) =>
                  expense.id === expenseId
                    ? {
                        ...expense,
                        title: patch.title,
                        amount: patch.amount,
                        paidBy: patch.paidBy,
                        paidById: patch.paidById,
                      }
                    : expense,
                ),
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
    case 'events/removeParticipants': {
      const { eventId, participantIds } = action.payload;
      if (participantIds.length === 0) {
        return state;
      }
      const idsSet = new Set(participantIds);
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                participants: event.participants.filter((participant) => !idsSet.has(participant.id)),
              }
            : event,
        ),
        paymentsByEvent: {
          ...state.paymentsByEvent,
          [eventId]: [],
        },
      };
    }
    case 'events/removePeopleEverywhere': {
      const { personIds } = action.payload;
      if (personIds.length === 0) {
        return state;
      }
      const idsSet = new Set(personIds);

      const deletedNames = new Set(
        state.events.flatMap((event) =>
          event.participants
            .filter((participant) => idsSet.has(participant.id))
            .map((participant) => participant.name.toLowerCase()),
        ),
      );

      const nextEvents = state.events.map((event) => ({
        ...event,
        participants: event.participants.filter((participant) => !idsSet.has(participant.id)),
        expenses: event.expenses.filter((expense) => {
          if (expense.paidById && idsSet.has(expense.paidById)) {
            return false;
          }
          return !deletedNames.has(expense.paidBy.trim().toLowerCase());
        }),
      }));

      const nextPaymentsByEvent = Object.fromEntries(
        Object.entries(state.paymentsByEvent).map(([eventId, payments]) => [
          eventId,
          payments.filter((payment) => !idsSet.has(payment.fromId) && !idsSet.has(payment.toId)),
        ]),
      );

      return {
        ...state,
        events: nextEvents,
        paymentsByEvent: nextPaymentsByEvent,
      };
    }
    case 'events/removeEvents': {
      const idsSet = new Set(action.payload.eventIds);
      const nextEvents = state.events.filter((event) => !idsSet.has(event.id));
      const nextPaymentsByEvent = Object.fromEntries(
        Object.entries(state.paymentsByEvent).filter(([eventId]) => !idsSet.has(eventId)),
      );

      return {
        ...state,
        events: nextEvents,
        paymentsByEvent: nextPaymentsByEvent,
      };
    }
    case 'events/removeExpenses': {
      const { eventId, expenseIds } = action.payload;
      if (expenseIds.length === 0) {
        return state;
      }

      const idsSet = new Set(expenseIds);
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                expenses: event.expenses.filter((expense) => !idsSet.has(expense.id)),
              }
            : event,
        ),
        paymentsByEvent: {
          ...state.paymentsByEvent,
          [eventId]: [],
        },
      };
    }
    default:
      return state;
  }
}

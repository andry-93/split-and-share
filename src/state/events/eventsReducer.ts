import { EventsAction, EventsState } from '@/state/events/eventsTypes';

export function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'events/create': {
      const { id, name, description, currency, date, groupId } = action.payload;
      return {
        ...state,
        events: [
          {
            id,
            name,
            description,
            currency,
            date: date ?? null,
            groupId,
            createdAt: now,
            updatedAt: now,
            expenses: [],
            participants: [],
          },
          ...state.events,
        ],
      };
    }
    case 'events/createGroup': {
      const { id, name, description } = action.payload;
      return {
        ...state,
        groups: [{ id, name, description, createdAt: now, updatedAt: now }, ...state.groups],
      };
    }
    case 'events/updateGroup': {
      const { groupId, name, description } = action.payload;
      return {
        ...state,
        groups: state.groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                name,
                description,
                updatedAt: now,
              }
            : group,
        ),
      };
    }
    case 'events/update': {
      const { eventId, name, description, currency, date, groupId } = action.payload;
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
                groupId,
                updatedAt: now,
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
                updatedAt: now,
                expenses: [
                  {
                    ...expense,
                    createdAt: now,
                    updatedAt: now,
                  },
                  ...event.expenses,
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
    case 'events/updateExpense': {
      const { eventId, expenseId, patch } = action.payload;
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                updatedAt: now,
                expenses: event.expenses.map((expense) =>
                  expense.id === expenseId
                    ? {
                        ...expense,
                        title: patch.title,
                        amount: patch.amount,
                        paidBy: patch.paidBy,
                        paidById: patch.paidById,
                        updatedAt: now,
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
                updatedAt: now,
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
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                updatedAt: now,
              }
            : event,
        ),
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
                updatedAt: now,
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
        updatedAt: now,
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
    case 'events/removeGroups': {
      if (action.payload.groupIds.length === 0) {
        return state;
      }
      const groupIdsSet = new Set(action.payload.groupIds);
      const nextGroups = state.groups.filter((group) => !groupIdsSet.has(group.id));
      const removedEventIds = new Set(
        state.events.filter((event) => event.groupId && groupIdsSet.has(event.groupId)).map((event) => event.id),
      );
      const nextEvents = state.events.filter((event) => !removedEventIds.has(event.id));
      const nextPaymentsByEvent = Object.fromEntries(
        Object.entries(state.paymentsByEvent).filter(([eventId]) => !removedEventIds.has(eventId)),
      );

      return {
        ...state,
        groups: nextGroups,
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
                updatedAt: now,
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

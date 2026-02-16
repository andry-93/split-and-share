import { EventGroupItem, EventItem, ParticipantItem } from '@/features/events/types/events';
import { EventPayment } from '@/state/events/paymentsModel';

export type EventsState = {
  events: EventItem[];
  groups: EventGroupItem[];
  paymentsByEvent: Record<string, EventPayment[]>;
};

export type EventsAction =
  | {
      type: 'events/create';
      payload: { id: string; name: string; description?: string; currency?: string; date?: string | null; groupId?: string };
    }
  | {
      type: 'events/update';
      payload: { eventId: string; name: string; description?: string; currency?: string; date?: string | null; groupId?: string };
    }
  | { type: 'events/addExpense'; payload: { eventId: string; expense: { id: string; title: string; amount: number; paidBy: string; paidById?: string } } }
  | {
      type: 'events/updateExpense';
      payload: { eventId: string; expenseId: string; patch: { title: string; amount: number; paidBy: string; paidById?: string } };
    }
  | { type: 'events/addParticipants'; payload: { eventId: string; participants: ParticipantItem[] } }
  | { type: 'events/registerPayment'; payload: { eventId: string; payment: EventPayment } }
  | { type: 'events/removeParticipants'; payload: { eventId: string; participantIds: string[] } }
  | { type: 'events/removePeopleEverywhere'; payload: { personIds: string[] } }
  | { type: 'events/removeEvents'; payload: { eventIds: string[] } }
  | { type: 'events/createGroup'; payload: { id: string; name: string; description?: string } }
  | { type: 'events/updateGroup'; payload: { groupId: string; name: string; description?: string } }
  | { type: 'events/removeGroups'; payload: { groupIds: string[] } }
  | { type: 'events/removeExpenses'; payload: { eventId: string; expenseIds: string[] } };

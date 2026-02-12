import { EventItem, ParticipantItem } from '../../features/events/types/events';
import { EventPayment } from './paymentsModel';

export type EventsState = {
  events: EventItem[];
  paymentsByEvent: Record<string, EventPayment[]>;
};

export type EventsAction =
  | { type: 'events/create'; payload: { id: string; name: string; description?: string; currency?: string } }
  | { type: 'events/addExpense'; payload: { eventId: string; expense: { id: string; title: string; amount: number; paidBy: string; paidById?: string } } }
  | { type: 'events/addParticipants'; payload: { eventId: string; participants: ParticipantItem[] } }
  | { type: 'events/registerPayment'; payload: { eventId: string; payment: EventPayment } };

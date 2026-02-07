import { EventItem, ParticipantItem } from '../../features/events/types/events';

export type EventsState = {
  events: EventItem[];
  paidSimplifiedByEvent: Record<string, string[]>;
};

export type EventsAction =
  | { type: 'events/create'; payload: { id: string; name: string; description?: string } }
  | { type: 'events/addExpense'; payload: { eventId: string; expense: { id: string; title: string; amount: number; paidBy: string } } }
  | { type: 'events/addParticipants'; payload: { eventId: string; participants: ParticipantItem[] } }
  | { type: 'events/markSimplifiedPaid'; payload: { eventId: string; debtId: string } }
  | { type: 'events/resetSimplifiedPaid'; payload: { eventId: string } };

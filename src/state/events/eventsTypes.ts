import { EventGroupItem, EventItem } from '@/features/events/types/events';
import { EventPayment } from '@/state/events/paymentsModel';

export type EventsState = {
  events: EventItem[];
  groups: EventGroupItem[];
  paymentsByEvent: Record<string, EventPayment[]>;
};

import { ParticipantItem } from '@/features/events/types/events';
import { EventPayment } from '@/state/events/paymentsModel';

export type CreateEventPayload = {
  id: string;
  name: string;
  description?: string;
  currency?: string;
  date?: string | null;
  groupId?: string;
};

export type UpdateEventPayload = {
  eventId: string;
  name: string;
  description?: string;
  currency?: string;
  date?: string | null;
  groupId?: string;
};

export type CreateGroupPayload = { id: string; name: string; description?: string };
export type UpdateGroupPayload = { groupId: string; name: string; description?: string };

export type AddExpensePayload = {
  eventId: string;
  expense: { id: string; title: string; amount: number; paidBy: string; paidById?: string };
};

export type UpdateExpensePayload = {
  eventId: string;
  expenseId: string;
  patch: { title: string; amount: number; paidBy: string; paidById?: string };
};

export type AddParticipantsPayload = { eventId: string; participants: ParticipantItem[] };
export type RegisterPaymentPayload = { eventId: string; payment: EventPayment };
export type RemoveParticipantsPayload = { eventId: string; participantIds: string[] };
export type RemovePeopleEverywherePayload = { personIds: string[] };
export type RemoveEventsPayload = { eventIds: string[] };
export type RemoveGroupsPayload = { groupIds: string[] };
export type RemoveExpensesPayload = { eventId: string; expenseIds: string[] };

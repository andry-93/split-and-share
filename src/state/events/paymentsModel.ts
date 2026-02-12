export type PaymentSource = 'detailed' | 'simplified';

export type EventPayment = {
  id: string;
  eventId: string;
  fromId: string;
  toId: string;
  amount: number;
  createdAt: string;
  source: PaymentSource;
};

type CreateEventPaymentInput = {
  id: string;
  eventId: string;
  fromId: string;
  toId: string;
  amount: number;
  source: PaymentSource;
};

export function createEventPayment(input: CreateEventPaymentInput): EventPayment {
  return {
    id: input.id,
    eventId: input.eventId,
    fromId: input.fromId,
    toId: input.toId,
    amount: input.amount,
    source: input.source,
    createdAt: new Date().toISOString(),
  };
}

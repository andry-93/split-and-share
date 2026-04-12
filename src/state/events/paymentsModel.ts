export type PaymentSource = 'detailed' | 'simplified' | 'pool';

export type EventPayment = {
  id: string;
  eventId: string;
  fromId: string;
  toId: string;
  amountMinor: number;
  createdAt: string;
  source: PaymentSource;
};

type CreateEventPaymentInput = {
  id: string;
  eventId: string;
  fromId: string;
  toId: string;
  amountMinor: number;
  source: PaymentSource;
};

export function createEventPayment(input: CreateEventPaymentInput): EventPayment {
  return {
    id: input.id,
    eventId: input.eventId,
    fromId: input.fromId,
    toId: input.toId,
    amountMinor: input.amountMinor,
    source: input.source,
    createdAt: new Date().toISOString(),
  };
}

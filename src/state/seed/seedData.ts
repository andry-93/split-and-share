import { EventItem, ParticipantItem } from '@/features/events/types/events';
import { PersonItem } from '@/features/people/types/people';

export type SeedPerson = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  isMe?: boolean;
};

export type SeedExpense = {
  id: string;
  title: string;
  amount: number;
  paidById: string;
  splitBetweenIds: string[];
};

export type SeedEvent = {
  id: string;
  name: string;
  description?: string;
  currency?: string;
  date?: string | null;
  participantIds: string[];
  expenses: SeedExpense[];
};

const peopleSeed: SeedPerson[] = [
  { id: 'person-me', name: 'Me', email: 'me@example.com', isMe: true },
  { id: 'person-1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'person-2', name: 'Bob Lee', phone: '+1 555 0134' },
  { id: 'person-3', name: 'Charlie Kim' },
  { id: 'person-4', name: 'Dana Patel', email: 'dana@example.com' },
];

const eventsSeed: SeedEvent[] = [
  {
    id: 'seed-1',
    name: 'Ski Trip',
    description: 'Weekend in the mountains',
    currency: 'USD',
    date: '2024-12-05T00:00:00.000Z',
    participantIds: ['person-me', 'person-1', 'person-2', 'person-3'],
    expenses: [
      {
        id: 'exp-1',
        title: 'Cabin rental',
        amount: 420,
        paidById: 'person-1',
        splitBetweenIds: ['person-me', 'person-1', 'person-2', 'person-3'],
      },
      {
        id: 'exp-2',
        title: 'Groceries',
        amount: 86,
        paidById: 'person-2',
        splitBetweenIds: ['person-me', 'person-1', 'person-2', 'person-3'],
      },
    ],
  },
  {
    id: 'seed-2',
    name: 'Team Dinner',
    currency: 'EUR',
    date: '2024-12-10T00:00:00.000Z',
    participantIds: ['person-me', 'person-2', 'person-4'],
    expenses: [
      {
        id: 'exp-3',
        title: 'Dinner bill',
        amount: 180,
        paidById: 'person-4',
        splitBetweenIds: ['person-me', 'person-2', 'person-4'],
      },
    ],
  },
  {
    id: 'seed-3',
    name: 'Apartment Supplies',
    description: 'Kitchen + cleaning',
    date: null,
    participantIds: [],
    expenses: [],
  },
];

function toParticipantMap() {
  return new Map<string, SeedPerson>(peopleSeed.map((person) => [person.id, person]));
}

function mapParticipant(person: SeedPerson): ParticipantItem {
  return {
    id: person.id,
    name: person.name,
    phone: person.phone,
    email: person.email,
    isMe: person.isMe,
  };
}

export function createInitialPeopleSeed(): PersonItem[] {
  return peopleSeed.map((person) => ({
    id: person.id,
    name: person.name,
    phone: person.phone,
    email: person.email,
    note: person.note,
    isMe: person.isMe,
  }));
}

export function createInitialEventsSeed(): EventItem[] {
  const peopleById = toParticipantMap();

  return eventsSeed.map((event) => {
    const participants = event.participantIds
      .map((id) => peopleById.get(id))
      .filter((person): person is SeedPerson => Boolean(person))
      .map(mapParticipant);

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      currency: event.currency,
      date: event.date ?? null,
      participants,
      expenses: event.expenses
        .map((expense) => {
          const payer = peopleById.get(expense.paidById);
          if (!payer) {
            return null;
          }
          return {
            id: expense.id,
            title: expense.title,
            amount: expense.amount,
            paidBy: payer.name,
            paidById: payer.id,
          };
        })
        .filter((expense): expense is NonNullable<typeof expense> => Boolean(expense)),
    };
  });
}

export type EventCalculationSeed = {
  id: string;
  name: string;
  currency?: string;
  participantIds: string[];
  expenses: SeedExpense[];
};

/**
 * Normalized seed format for calculations and future storage migration.
 * Uses ids for payer/split members to avoid matching by display name.
 */
export function createCalculationSeed(): EventCalculationSeed[] {
  return eventsSeed.map((event) => ({
    id: event.id,
    name: event.name,
    currency: event.currency,
    participantIds: [...event.participantIds],
    expenses: event.expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      paidById: expense.paidById,
      splitBetweenIds: [...expense.splitBetweenIds],
    })),
  }));
}

import { EventItem } from '../types/events';

export const initialEvents: EventItem[] = [
  {
    id: 'seed-1',
    name: 'Ski Trip',
    description: 'Weekend in the mountains',
    participants: [
      { id: 'person-1', name: 'Alice Johnson' },
      { id: 'person-2', name: 'Bob Lee' },
      { id: 'person-3', name: 'Charlie Kim' },
    ],
    expenses: [
      { id: 'exp-1', title: 'Cabin rental', amount: 420, paidBy: 'Alex' },
      { id: 'exp-2', title: 'Groceries', amount: 86, paidBy: 'Maria' },
    ],
  },
  {
    id: 'seed-2',
    name: 'Team Dinner',
    participants: [
      { id: 'person-4', name: 'Dana Patel' },
      { id: 'person-2', name: 'Bob Lee' },
    ],
    expenses: [{ id: 'exp-3', title: 'Dinner bill', amount: 180, paidBy: 'Chris' }],
  },
  {
    id: 'seed-3',
    name: 'Apartment Supplies',
    description: 'Kitchen + cleaning',
    participants: [],
    expenses: [],
  },
];

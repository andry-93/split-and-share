export type EventItem = {
  id: string;
  name: string;
  description?: string;
  expenses: ExpenseItem[];
  participants: ParticipantItem[];
};

export type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
};

export type ParticipantItem = {
  id: string;
  name: string;
  contact?: string;
};

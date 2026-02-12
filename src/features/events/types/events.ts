export type EventItem = {
  id: string;
  name: string;
  description?: string;
  currency?: string;
  date?: string | null;
  expenses: ExpenseItem[];
  participants: ParticipantItem[];
};

export type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  paidById?: string;
};

export type ParticipantItem = {
  id: string;
  name: string;
  contact?: string;
  isMe?: boolean;
};

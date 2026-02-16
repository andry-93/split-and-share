export type EventItem = {
  id: string;
  name: string;
  description?: string;
  currency?: string;
  date?: string | null;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
  expenses: ExpenseItem[];
  participants: ParticipantItem[];
};

export type EventGroupItem = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  paidById?: string;
  createdAt: string;
  updatedAt: string;
};

export type ParticipantItem = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isMe?: boolean;
};

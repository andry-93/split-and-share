import { PersonItem } from '@/features/people/types/people';

export type AddPersonPayload = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  isMe?: boolean;
};

export type UpdatePersonPayload = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  note?: string;
};

export type AddManyPayload = { people: PersonItem[] };
export type RemoveManyPayload = { ids: string[] };

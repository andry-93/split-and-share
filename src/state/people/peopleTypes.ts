import { PersonItem } from '../../features/people/types/people';

export type PeopleState = {
  people: PersonItem[];
};

export type PeopleAction =
  | {
      type: 'people/add';
      payload: { id: string; name: string; phone?: string; email?: string; note?: string; isMe?: boolean };
    }
  | { type: 'people/update'; payload: { id: string; name: string; phone?: string; email?: string; note?: string } }
  | { type: 'people/addMany'; payload: { people: PersonItem[] } }
  | { type: 'people/removeMany'; payload: { ids: string[] } };

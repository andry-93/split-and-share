import { PersonItem } from '../../features/people/types/people';

export type PeopleState = {
  people: PersonItem[];
};

export type PeopleAction =
  | { type: 'people/add'; payload: { id: string; name: string; contact?: string; note?: string } }
  | { type: 'people/addMany'; payload: { people: PersonItem[] } };

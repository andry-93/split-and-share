import { PersonItem } from '@/features/people/types/people';
import { selectCurrentUser } from '@/state/people/peopleSelectors';
import { PeopleState } from '@/state/people/peopleTypes';
import { parsePeopleState } from '@/state/storage/guards';
import { readJSON, writeJSON } from '@/state/storage/mmkv';
import { STORAGE_KEYS } from '@/state/storage/storageKeys';

function normalizePeople(people: PersonItem[]): PersonItem[] {
  const currentUser = selectCurrentUser(people);
  if (!currentUser) {
    return people;
  }

  return people.map((person) => ({
    ...person,
    isMe: person.id === currentUser.id,
  }));
}

export function initPeopleState(): PeopleState {
  const persistedPeople = readJSON<unknown>(STORAGE_KEYS.people);
  const parsed = parsePeopleState(persistedPeople);
  return {
    people: normalizePeople(parsed.people),
  };
}

export function persistPeople(state: PeopleState) {
  writeJSON(STORAGE_KEYS.people, state.people);
}


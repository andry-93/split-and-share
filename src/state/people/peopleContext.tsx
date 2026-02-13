import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { PersonItem } from '../../features/people/types/people';
import { readJSON, writeJSON } from '../storage/mmkv';
import { parsePeopleState } from '../storage/guards';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { selectCurrentUser } from './peopleSelectors';
import { peopleReducer } from './peopleReducer';
import { PeopleAction, PeopleState } from './peopleTypes';
import { createEntityId } from '../../shared/utils/id';
import { normalizeOptionalText } from '../../shared/utils/validation';

const PeopleStateContext = createContext<PeopleState | undefined>(undefined);
const PeopleDispatchContext = createContext<React.Dispatch<PeopleAction> | undefined>(undefined);

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

function initState(): PeopleState {
  const persistedPeople = readJSON<unknown>(STORAGE_KEYS.people);
  const parsed = parsePeopleState(persistedPeople);
  return {
    people: normalizePeople(parsed.people),
  };
}

function splitLegacyContact(contact?: string) {
  const normalized = normalizeOptionalText(contact);
  if (!normalized) {
    return { phone: undefined, email: undefined };
  }
  if (normalized.includes('@')) {
    return { phone: undefined, email: normalized };
  }
  return { phone: normalized, email: undefined };
}

export function PeopleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(peopleReducer, undefined, initState);

  return (
    <PeopleStateContext.Provider value={state}>
      <PeopleDispatchContext.Provider value={dispatch}>{children}</PeopleDispatchContext.Provider>
    </PeopleStateContext.Provider>
  );
}

export function usePeopleState() {
  const ctx = useContext(PeopleStateContext);
  if (!ctx) {
    throw new Error('usePeopleState must be used within PeopleProvider');
  }
  return ctx;
}

export function usePeopleActions() {
  const dispatch = useContext(PeopleDispatchContext);
  if (!dispatch) {
    throw new Error('usePeopleActions must be used within PeopleProvider');
  }

  return useMemo(
    () => ({
      addPerson: (payload: { name: string; phone?: string; email?: string; note?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Name is required.');
        }

        const trimmedPhone = payload.phone?.trim();
        const trimmedEmail = payload.email?.trim();
        const trimmedNote = payload.note?.trim();

        dispatch({
          type: 'people/add',
          payload: {
            id: createEntityId('person'),
            name: trimmedName,
            phone: normalizeOptionalText(trimmedPhone),
            email: normalizeOptionalText(trimmedEmail),
            note: normalizeOptionalText(trimmedNote),
          },
        });
      },
      updatePerson: (payload: { id: string; name: string; phone?: string; email?: string; note?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Name is required.');
        }

        dispatch({
          type: 'people/update',
          payload: {
            id: payload.id,
            name: trimmedName,
            phone: normalizeOptionalText(payload.phone),
            email: normalizeOptionalText(payload.email),
            note: normalizeOptionalText(payload.note),
          },
        });
      },
      addPeople: (payload: { people: { name: string; phone?: string; email?: string; contact?: string; crypto?: string }[] }) => {
        const nextPeople: PersonItem[] = payload.people.map((person) => {
          const legacy = splitLegacyContact(person.contact);
          return {
            id: createEntityId('person'),
            name: person.name,
            phone: normalizeOptionalText(person.phone ?? person.crypto) ?? legacy.phone,
            email: normalizeOptionalText(person.email) ?? legacy.email,
          };
        });

        dispatch({ type: 'people/addMany', payload: { people: nextPeople } });
      },
      removePeople: (payload: { ids: string[] }) => {
        if (payload.ids.length === 0) {
          return;
        }

        dispatch({ type: 'people/removeMany', payload: { ids: payload.ids } });
      },
    }),
    [dispatch],
  );
}

export function persistPeople(state: PeopleState) {
  writeJSON(STORAGE_KEYS.people, state.people);
}

import React, { createContext, useContext, useMemo, useReducer } from 'react';
import uuid from 'react-native-uuid';
import { initialPeople } from '../../features/people/data/initialPeople';
import { PersonItem } from '../../features/people/types/people';
import { readJSON, writeJSON } from '../storage/mmkv';
import { selectCurrentUser } from './peopleSelectors';
import { peopleReducer } from './peopleReducer';
import { PeopleAction, PeopleState } from './peopleTypes';

const PeopleStateContext = createContext<PeopleState | undefined>(undefined);
const PeopleDispatchContext = createContext<React.Dispatch<PeopleAction> | undefined>(undefined);

function normalizePeople(people: PersonItem[]): PersonItem[] {
  if (!Array.isArray(people) || people.length === 0) {
    return initialPeople;
  }

  const currentUser = selectCurrentUser(people);
  if (!currentUser) {
    return initialPeople;
  }

  return people.map((person) => ({
    ...person,
    isMe: person.id === currentUser.id,
  }));
}

function initState(): PeopleState {
  const persistedPeople = readJSON<PersonItem[]>('people');
  return {
    people: normalizePeople(Array.isArray(persistedPeople) ? persistedPeople : initialPeople),
  };
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
      addPerson: (payload: { name: string; contact?: string; note?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Name is required.');
        }

        const trimmedContact = payload.contact?.trim();
        const trimmedNote = payload.note?.trim();

        dispatch({
          type: 'people/add',
          payload: {
            id: `person-${String(uuid.v4())}`,
            name: trimmedName,
            contact: trimmedContact || undefined,
            note: trimmedNote || undefined,
          },
        });
      },
      updatePerson: (payload: { id: string; name: string; contact?: string; note?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Name is required.');
        }

        dispatch({
          type: 'people/update',
          payload: {
            id: payload.id,
            name: trimmedName,
            contact: payload.contact?.trim() || undefined,
            note: payload.note?.trim() || undefined,
          },
        });
      },
      addPeople: (payload: { people: { name: string; contact?: string; crypto?: string }[] }) => {
        const nextPeople: PersonItem[] = payload.people.map((person) => ({
          id: `person-${String(uuid.v4())}`,
          name: person.name,
          // Keep backward compatibility if caller used `crypto` by mistake.
          contact: person.contact ?? person.crypto ?? undefined,
        }));

        dispatch({ type: 'people/addMany', payload: { people: nextPeople } });
      },
    }),
    [dispatch],
  );
}

export function persistPeople(state: PeopleState) {
  writeJSON('people', state.people);
}

import { createSelector } from '@reduxjs/toolkit';
import { PersonItem } from '@/features/people/types/people';
import { PeopleState } from '@/state/people/peopleTypes';
import { RootState } from '@/state/store';
import { normalizePhoneForComparison, sortPeopleWithCurrentUserFirst } from '@/shared/utils/people';

export const selectPeopleState = (state: RootState): PeopleState => state.people;
export const selectPeople = (state: RootState): PersonItem[] => state.people.people;

export function selectCurrentUser(people: PersonItem[]): PersonItem | undefined {
  const explicit = people.find((person) => person.isMe);
  if (explicit) {
    return explicit;
  }

  const byName = people.find((person) => person.name.trim().toLowerCase() === 'me');
  if (byName) {
    return byName;
  }

  return people[0];
}

export function createPeopleListSelectors() {
  const selectFilteredSortedPeopleMemo = createSelector(
    [(people: PersonItem[]) => people, (_people: PersonItem[], query: string) => query],
    (people, query) => {
      const normalized = query.trim().toLowerCase();
      const normalizedDigits = normalizePhoneForComparison(query);
      if (!normalized) {
        return sortPeopleWithCurrentUserFirst(people);
      }

      return sortPeopleWithCurrentUserFirst(
        people.filter((person) => {
          const nameMatch = person.name.toLowerCase().includes(normalized);
          const phoneMatch =
            (person.phone?.toLowerCase().includes(normalized) ?? false) ||
            (normalizedDigits.length > 0 &&
              normalizePhoneForComparison(person.phone).includes(normalizedDigits));
          const emailMatch = person.email?.toLowerCase().includes(normalized) ?? false;
          return nameMatch || phoneMatch || emailMatch;
        }),
      );
    },
  );

  return {
    selectFilteredSortedPeopleMemo,
  };
}

type ContactCandidate = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

type PeopleLookup = {
  nameSet: Set<string>;
  phoneSet: Set<string>;
  emailSet: Set<string>;
};

export function createContactsPickerSelectors() {
  const selectPeopleLookupMemo = createSelector([(people: PersonItem[]) => people], (people) => {
    const nameSet = new Set<string>();
    const phoneSet = new Set<string>();
    const emailSet = new Set<string>();

    people.forEach((person) => {
      const normalizedName = person.name.trim().toLowerCase();
      if (normalizedName) {
        nameSet.add(normalizedName);
      }
      const normalizedPhone = normalizePhoneForComparison(person.phone);
      if (normalizedPhone) {
        phoneSet.add(normalizedPhone);
      }
      const normalizedEmail = person.email?.trim().toLowerCase();
      if (normalizedEmail) {
        emailSet.add(normalizedEmail);
      }
    });

    return { nameSet, phoneSet, emailSet } satisfies PeopleLookup;
  });

  const selectFilteredContactsMemo = createSelector(
    [(contacts: ContactCandidate[]) => contacts, (_contacts: ContactCandidate[], query: string) => query],
    (contacts, query) => {
      const normalized = query.trim().toLowerCase();
      const normalizedDigits = normalizePhoneForComparison(query);
      if (!normalized) {
        return contacts;
      }
      return contacts.filter((contact) => {
        const nameMatch = contact.name.toLowerCase().includes(normalized);
        const phoneMatch =
          (contact.phone?.toLowerCase().includes(normalized) ?? false) ||
          (normalizedDigits.length > 0 &&
            normalizePhoneForComparison(contact.phone).includes(normalizedDigits));
        const emailMatch = contact.email?.toLowerCase().includes(normalized) ?? false;
        return nameMatch || phoneMatch || emailMatch;
      });
    },
  );

  const selectSelectedContactsMemo = createSelector(
    [
      (contacts: ContactCandidate[]) => contacts,
      (_contacts: ContactCandidate[], selectedIds: string[]) => selectedIds,
    ],
    (contacts, selectedIds) => {
      const selectedSet = new Set(selectedIds);
      return contacts.filter((contact) => selectedSet.has(contact.id));
    },
  );

  return {
    selectPeopleLookupMemo,
    selectFilteredContactsMemo,
    selectSelectedContactsMemo,
  };
}

import { useMemo } from 'react';
import { DeviceContact } from '@/features/people/types/contacts';
import { PersonItem } from '@/features/people/types/people';
import { useSelectorFactory } from '@/shared/hooks/useSelectorFactory';
import { createContactsPickerSelectors } from '@/state/people/peopleSelectors';

type UseContactsPickerModelInput = {
  people: PersonItem[];
  contacts: DeviceContact[];
  query: string;
  selectedIds: string[];
};

export function useContactsPickerModel({
  people,
  contacts,
  query,
  selectedIds,
}: UseContactsPickerModelInput) {
  const selectors = useSelectorFactory(createContactsPickerSelectors);

  const peopleLookup = useMemo(
    () => selectors.selectPeopleLookupMemo(people),
    [people, selectors],
  );
  const filteredContacts = useMemo(
    () => selectors.selectFilteredContactsMemo(contacts, query),
    [contacts, query, selectors],
  );
  const selectedContacts = useMemo(
    () => selectors.selectSelectedContactsMemo(contacts, selectedIds),
    [contacts, selectedIds, selectors],
  );

  return {
    peopleLookup,
    filteredContacts,
    selectedContacts,
  };
}

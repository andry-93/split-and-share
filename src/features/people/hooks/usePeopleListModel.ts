import { useMemo } from 'react';
import { PersonItem } from '@/features/people/types/people';
import { useSelectorFactory } from '@/shared/hooks/useSelectorFactory';
import { createPeopleListSelectors } from '@/state/people/peopleSelectors';

type UsePeopleListModelInput = {
  people: PersonItem[];
  query: string;
};

export function usePeopleListModel({ people, query }: UsePeopleListModelInput) {
  const selectors = useSelectorFactory(createPeopleListSelectors);

  const filteredPeople = useMemo(
    () => selectors.selectFilteredSortedPeopleMemo(people, query),
    [people, query, selectors],
  );

  return {
    filteredPeople,
  };
}

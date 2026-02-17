import { useMemo } from 'react';
import { PersonItem } from '@/features/people/types/people';
import { selectPeopleState } from '@/state/people/peopleSelectors';
import { persistPeople } from '@/state/people/peopleStateInit';
import { peopleActions } from '@/state/people/peopleSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { createEntityId } from '@/shared/utils/id';
import { normalizeOptionalText } from '@/shared/utils/validation';

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

export function usePeopleState() {
  return useAppSelector(selectPeopleState);
}

export function usePeopleActions() {
  const dispatch = useAppDispatch();

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

        dispatch(
          peopleActions.addPerson({
            id: createEntityId('person'),
            name: trimmedName,
            phone: normalizeOptionalText(trimmedPhone),
            email: normalizeOptionalText(trimmedEmail),
            note: normalizeOptionalText(trimmedNote),
          }),
        );
      },
      updatePerson: (payload: { id: string; name: string; phone?: string; email?: string; note?: string }) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
          throw new Error('Name is required.');
        }

        dispatch(
          peopleActions.updatePerson({
            id: payload.id,
            name: trimmedName,
            phone: normalizeOptionalText(payload.phone),
            email: normalizeOptionalText(payload.email),
            note: normalizeOptionalText(payload.note),
          }),
        );
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

        dispatch(peopleActions.addMany({ people: nextPeople }));
      },
      removePeople: (payload: { ids: string[] }) => {
        if (payload.ids.length === 0) {
          return;
        }

        dispatch(peopleActions.removeMany({ ids: payload.ids }));
      },
    }),
    [dispatch],
  );
}

export { persistPeople };

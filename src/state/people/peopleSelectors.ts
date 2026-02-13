import { PersonItem } from '@/features/people/types/people';

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


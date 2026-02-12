type PersonLike = {
  name: string;
  isMe?: boolean;
};

export function isCurrentUserPerson(person: PersonLike): boolean {
  if (person.isMe) {
    return true;
  }
  return person.name.trim().toLowerCase() === 'me';
}

export function sortPeopleWithCurrentUserFirst<T extends PersonLike>(people: readonly T[]): T[] {
  return [...people].sort((left, right) => {
    const leftIsMe = isCurrentUserPerson(left);
    const rightIsMe = isCurrentUserPerson(right);

    if (leftIsMe && !rightIsMe) {
      return -1;
    }
    if (!leftIsMe && rightIsMe) {
      return 1;
    }

    return left.name.localeCompare(right.name, 'en', { sensitivity: 'base' });
  });
}

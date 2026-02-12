type PersonLike = {
  name: string;
  isMe?: boolean;
};

type PersonContactLike = {
  phone?: string;
  email?: string;
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

export function getPreferredPersonContact(person: PersonContactLike): string | undefined {
  const phone = person.phone?.trim();
  if (phone) {
    return phone;
  }

  const email = person.email?.trim();
  if (email) {
    return email;
  }

  return undefined;
}

import { PersonItem } from '../types/people';

export type MockContact = {
  id: string;
  name: string;
  contact: string;
};

export const mockContacts: MockContact[] = [
  { id: 'contact-1', name: 'Alice Johnson', contact: 'alice@example.com' },
  { id: 'contact-2', name: 'Bob Lee', contact: '+1 555 0134' },
  { id: 'contact-3', name: 'Charlie Kim', contact: 'charlie@example.com' },
  { id: 'contact-4', name: 'Dana Patel', contact: '+1 555 0177' },
  { id: 'contact-5', name: 'Erin Gray', contact: 'erin@example.com' },
  { id: 'contact-6', name: 'Felix Reed', contact: '+1 555 0222' },
];

export function isContactAlreadyAdded(contact: MockContact, people: PersonItem[]) {
  const normalizedName = contact.name.trim().toLowerCase();
  const normalizedContact = contact.contact.trim().toLowerCase();

  return people.some((person) => {
    const personName = person.name.trim().toLowerCase();
    const personContact = person.contact?.trim().toLowerCase();

    if (personContact && personContact === normalizedContact) {
      return true;
    }

    return personName === normalizedName;
  });
}

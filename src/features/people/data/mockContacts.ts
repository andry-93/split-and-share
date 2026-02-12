import { PersonItem } from '../types/people';

export type MockContact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

export const mockContacts: MockContact[] = [
  { id: 'contact-1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'contact-2', name: 'Bob Lee', phone: '+1 555 0134' },
  { id: 'contact-3', name: 'Charlie Kim', email: 'charlie@example.com' },
  { id: 'contact-4', name: 'Dana Patel', phone: '+1 555 0177' },
  { id: 'contact-5', name: 'Erin Gray', email: 'erin@example.com' },
  { id: 'contact-6', name: 'Felix Reed', phone: '+1 555 0222' },
];

export function isContactAlreadyAdded(contact: MockContact, people: PersonItem[]) {
  const normalizedName = contact.name.trim().toLowerCase();
  const normalizedPhone = contact.phone?.trim().toLowerCase();
  const normalizedEmail = contact.email?.trim().toLowerCase();

  return people.some((person) => {
    const personName = person.name.trim().toLowerCase();
    const personPhone = person.phone?.trim().toLowerCase();
    const personEmail = person.email?.trim().toLowerCase();

    if (normalizedPhone && personPhone && personPhone === normalizedPhone) {
      return true;
    }

    if (normalizedEmail && personEmail && personEmail === normalizedEmail) {
      return true;
    }

    return personName === normalizedName;
  });
}

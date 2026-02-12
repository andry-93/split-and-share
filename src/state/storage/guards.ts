import { EventItem } from '../../features/events/types/events';
import { PersonItem } from '../../features/people/types/people';
import { createDefaultEventsState, createDefaultPeopleState, createDefaultSettingsState } from '../defaultState';
import { EventPayment } from '../events/paymentsModel';
import { EventsState } from '../events/eventsTypes';
import { PeopleState } from '../people/peopleTypes';
import { SettingsState } from '../settings/settingsTypes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPersonItem(value: unknown): value is PersonItem {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.name === 'string';
}

function toNormalizedPerson(value: unknown): PersonItem | null {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null;
  }

  const legacyContact = typeof value.contact === 'string' ? value.contact.trim() : '';
  const phone =
    typeof value.phone === 'string'
      ? value.phone.trim()
      : legacyContact && !legacyContact.includes('@')
        ? legacyContact
        : undefined;
  const email =
    typeof value.email === 'string'
      ? value.email.trim()
      : legacyContact && legacyContact.includes('@')
        ? legacyContact
        : undefined;
  const note = typeof value.note === 'string' ? value.note.trim() : undefined;
  const isMe = typeof value.isMe === 'boolean' ? value.isMe : undefined;

  return {
    id: value.id,
    name: value.name,
    phone: phone || undefined,
    email: email || undefined,
    note: note || undefined,
    isMe,
  };
}

function isEventItem(value: unknown): value is EventItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.expenses) &&
    Array.isArray(value.participants)
  );
}

function isEventPayment(value: unknown): value is EventPayment {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.eventId === 'string' &&
    typeof value.fromId === 'string' &&
    typeof value.toId === 'string' &&
    Number.isFinite(value.amount) &&
    typeof value.createdAt === 'string' &&
    (value.source === 'detailed' || value.source === 'simplified')
  );
}

export function parseSettingsState(value: unknown): SettingsState {
  if (!isRecord(value)) {
    return createDefaultSettingsState();
  }

  const theme = value.theme;
  const language = value.language;
  const currency = value.currency;
  if (
    (theme !== 'light' && theme !== 'dark' && theme !== 'system') ||
    typeof language !== 'string' ||
    typeof currency !== 'string'
  ) {
    return createDefaultSettingsState();
  }

  return { theme, language, currency };
}

export function parsePeopleState(value: unknown): PeopleState {
  const fallback = createDefaultPeopleState();

  if (Array.isArray(value)) {
    const people = value.map(toNormalizedPerson).filter((person): person is PersonItem => Boolean(person));
    return {
      people: people.length > 0 ? people : fallback.people,
    };
  }

  if (!isRecord(value) || !Array.isArray(value.people)) {
    return fallback;
  }

  const people = value.people
    .map(toNormalizedPerson)
    .filter((person): person is PersonItem => Boolean(person));
  return {
    people: people.length > 0 ? people : fallback.people,
  };
}

export function parseEventsState(value: unknown): EventsState {
  const fallback = createDefaultEventsState();
  if (!isRecord(value) || !Array.isArray(value.events)) {
    return fallback;
  }

  const events = value.events.filter(isEventItem);
  const paymentsByEventRaw = isRecord(value.paymentsByEvent) ? value.paymentsByEvent : {};

  const paymentsByEvent = Object.entries(paymentsByEventRaw).reduce<EventsState['paymentsByEvent']>(
    (acc, [eventId, payments]) => {
      if (!Array.isArray(payments)) {
        acc[eventId] = [];
        return acc;
      }
      acc[eventId] = payments.filter(isEventPayment);
      return acc;
    },
    {},
  );

  return {
    events: events.length > 0 ? events : fallback.events,
    paymentsByEvent,
  };
}

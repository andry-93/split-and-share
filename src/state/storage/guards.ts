import { EventGroupItem, EventItem } from '@/features/events/types/events';
import { PersonItem } from '@/features/people/types/people';
import { createDefaultEventsState, createDefaultPeopleState, createDefaultSettingsState } from '@/state/defaultState';
import { EventPayment } from '@/state/events/paymentsModel';
import { EventsState } from '@/state/events/eventsTypes';
import { PeopleState } from '@/state/people/peopleTypes';
import { getSystemDefaultLanguage } from '@/state/settings/languageDefaults';
import { getSystemDefaultCurrency } from '@/state/settings/currencyDefaults';
import { normalizeLanguageCode } from '@/state/settings/languageCatalog';
import { normalizeCurrencyCode } from '@/shared/utils/currency';
import { SettingsState } from '@/state/settings/settingsTypes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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
    (typeof value.groupId === 'undefined' || typeof value.groupId === 'string') &&
    Array.isArray(value.expenses) &&
    Array.isArray(value.participants)
  );
}

function isEventGroupItem(value: unknown): value is EventGroupItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    (typeof value.description === 'undefined' || typeof value.description === 'string')
  );
}

function normalizeIsoDateString(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return new Date(parsed).toISOString();
}

function normalizeEventItem(value: EventItem): EventItem {
  const fallbackCreatedAt = new Date(0).toISOString();
  const createdAt = normalizeIsoDateString(
    (value as EventItem & { createdAt?: unknown }).createdAt,
    fallbackCreatedAt,
  );
  const updatedAt = normalizeIsoDateString(
    (value as EventItem & { updatedAt?: unknown }).updatedAt,
    createdAt,
  );

  return {
    ...value,
    createdAt,
    updatedAt,
    expenses: value.expenses.map((expense) => {
      const fallbackExpenseCreatedAt = createdAt;
      const expenseCreatedAt = normalizeIsoDateString(
        (expense as EventItem['expenses'][number] & { createdAt?: unknown }).createdAt,
        fallbackExpenseCreatedAt,
      );
      const expenseUpdatedAt = normalizeIsoDateString(
        (expense as EventItem['expenses'][number] & { updatedAt?: unknown }).updatedAt,
        expenseCreatedAt,
      );

      return {
        ...expense,
        createdAt: expenseCreatedAt,
        updatedAt: expenseUpdatedAt,
      };
    }),
  };
}

function normalizeEventGroupItem(value: EventGroupItem): EventGroupItem {
  const fallbackCreatedAt = new Date(0).toISOString();
  const createdAt = normalizeIsoDateString(
    (value as EventGroupItem & { createdAt?: unknown }).createdAt,
    fallbackCreatedAt,
  );
  const updatedAt = normalizeIsoDateString(
    (value as EventGroupItem & { updatedAt?: unknown }).updatedAt,
    createdAt,
  );

  return {
    ...value,
    createdAt,
    updatedAt,
  };
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
  const languageSource = value.languageSource;
  const currency = value.currency;
  const currencySource = value.currencySource;
  const debtsViewMode = value.debtsViewMode;
  if (
    (theme !== 'light' && theme !== 'dark' && theme !== 'system') ||
    typeof language !== 'string' ||
    typeof currency !== 'string'
  ) {
    return createDefaultSettingsState();
  }

  const normalizedLanguage = normalizeLanguageCode(language);
  const systemLanguage = getSystemDefaultLanguage();
  const normalizedCurrency = normalizeCurrencyCode(currency);
  const systemCurrency = getSystemDefaultCurrency();
  const resolvedLanguageSource: SettingsState['languageSource'] =
    languageSource === 'manual' || languageSource === 'system'
      ? languageSource
      : normalizedLanguage === systemLanguage
        ? 'system'
        : 'manual';
  const resolvedCurrencySource: SettingsState['currencySource'] =
    currencySource === 'manual' || currencySource === 'system'
      ? currencySource
      : 'system';

  return {
    theme,
    language: normalizedLanguage,
    languageSource: resolvedLanguageSource,
    currency: normalizedCurrency,
    currencySource: resolvedCurrencySource,
    debtsViewMode: debtsViewMode === 'detailed' ? 'detailed' : 'simplified',
  };
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

  const events = value.events.filter(isEventItem).map(normalizeEventItem);
  const groups = Array.isArray(value.groups)
    ? value.groups.filter(isEventGroupItem).map(normalizeEventGroupItem)
    : fallback.groups;
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
    groups,
    paymentsByEvent,
  };
}

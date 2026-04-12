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
    Array.isArray(value.participants) &&
    (typeof value.pools === 'undefined' || Array.isArray(value.pools))
  );
}

function isPoolItem(value: unknown): value is EventItem['pools'][number] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
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
  const participantIdsSet = new Set(
    value.participants
      .map((participant) => participant.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  );
  const allParticipantIds = Array.from(participantIdsSet);
  const poolIdsSet = new Set(
    (Array.isArray((value as { pools?: unknown[] }).pools)
      ? (value as { pools?: unknown[] }).pools ?? []
      : []
    )
      .map((pool) => (isRecord(pool) && typeof pool.id === 'string' ? pool.id : null))
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  );

  return {
    ...value,
    createdAt,
    updatedAt,
    pools: Array.isArray(value.pools) ? value.pools.filter(isPoolItem) : [],
    expenses: (value.expenses || [])
      .map((expense) => {
        try {
          if (!isRecord(expense)) return null;
          const fallbackExpenseCreatedAt = createdAt;
          const expenseCreatedAt = normalizeIsoDateString(
            (expense as any).createdAt,
            fallbackExpenseCreatedAt,
          );
          const expenseUpdatedAt = normalizeIsoDateString(
            (expense as any).updatedAt,
            expenseCreatedAt,
          );
          const rawSplitBetween = (expense as any).splitBetweenIds;
          const normalizedSplitBetween = Array.isArray(rawSplitBetween)
            ? Array.from(
                new Set(
                  rawSplitBetween.filter(
                    (id): id is string => typeof id === 'string' && participantIdsSet.has(id),
                  ),
                ),
              )
            : [];

          return {
            ...expense,
            amountMinor: typeof expense.amountMinor === 'number' ? Math.round(expense.amountMinor) : 0,
            splitBetweenIds:
              normalizedSplitBetween.length > 0
                ? normalizedSplitBetween
                : poolIdsSet.has((expense as { paidById?: string }).paidById ?? '')
                  ? []
                  : allParticipantIds,
            createdAt: expenseCreatedAt,
            updatedAt: expenseUpdatedAt,
          };
        } catch (e) {
          console.error('[Guards] Failed to normalize expense', e);
          return null;
        }
      })
      .filter((exp): exp is NonNullable<typeof exp> => exp !== null),
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
    Number.isFinite(value.amountMinor) &&
    typeof value.createdAt === 'string' &&
    (value.source === 'detailed' || value.source === 'simplified' || value.source === 'pool')
  );
}

export function parseSettingsState(value: unknown): SettingsState {
  const fallback = createDefaultSettingsState();
  if (!isRecord(value)) {
    return fallback;
  }

  const theme =
    value.theme === 'light' || value.theme === 'dark' || value.theme === 'system'
      ? value.theme
      : fallback.theme;

  const language = typeof value.language === 'string' ? normalizeLanguageCode(value.language) : fallback.language;
  const systemLanguage = getSystemDefaultLanguage();
  
  const languageSourceRaw = value.languageSource;
  const languageSource =
    languageSourceRaw === 'manual' || languageSourceRaw === 'system'
      ? languageSourceRaw
      : language === systemLanguage
        ? 'system'
        : 'manual';

  const currency = typeof value.currency === 'string' ? normalizeCurrencyCode(value.currency) : fallback.currency;
  const currencySourceRaw = value.currencySource;
  const currencySource =
    currencySourceRaw === 'manual' || currencySourceRaw === 'system'
      ? currencySourceRaw
      : 'system';

  const numberFormatRaw = value.numberFormat;
  const numberFormat =
    numberFormatRaw === 'us' || numberFormatRaw === 'eu' || numberFormatRaw === 'ru' || numberFormatRaw === 'ch'
      ? numberFormatRaw
      : fallback.numberFormat;

  const debtsViewMode = value.debtsViewMode === 'detailed' ? 'detailed' : 'simplified';

  const isSecurityEnabled = typeof value.isSecurityEnabled === 'boolean' ? value.isSecurityEnabled : fallback.isSecurityEnabled;
  const isBiometricsEnabled = typeof value.isBiometricsEnabled === 'boolean' ? value.isBiometricsEnabled : fallback.isBiometricsEnabled;
  const masterPasswordHash = typeof value.masterPasswordHash === 'string' ? value.masterPasswordHash : fallback.masterPasswordHash;
  const autoLockGracePeriod = typeof value.autoLockGracePeriod === 'number' ? value.autoLockGracePeriod : fallback.autoLockGracePeriod;
  const onboardingCompleted = typeof value.onboardingCompleted === 'boolean' ? value.onboardingCompleted : fallback.onboardingCompleted;

  return {
    theme,
    language,
    languageSource,
    numberFormat,
    currency,
    currencySource,
    debtsViewMode,
    isSecurityEnabled,
    isBiometricsEnabled,
    masterPasswordHash,
    autoLockGracePeriod,
    onboardingCompleted,
  };
}

export function parsePeopleState(value: unknown): PeopleState {
  const fallback = createDefaultPeopleState();

  if (Array.isArray(value)) {
    const people = value.map(toNormalizedPerson).filter((person): person is PersonItem => Boolean(person));
    return {
      people,
    };
  }

  if (!isRecord(value) || !Array.isArray(value.people)) {
    return fallback;
  }

  const people = value.people
    .map(toNormalizedPerson)
    .filter((person): person is PersonItem => Boolean(person));
  return {
    people,
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
    : [];
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
    events,
    groups,
    paymentsByEvent,
  };
}

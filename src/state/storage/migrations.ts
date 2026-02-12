import { initialEvents } from '../../features/events/data/initialEvents';
import { initialPeople } from '../../features/people/data/initialPeople';
import { EventsState } from '../events/eventsTypes';
import { PeopleState } from '../people/peopleTypes';
import { SettingsState } from '../settings/settingsTypes';
import { readJSON, storage, writeJSON } from './mmkv';

const SCHEMA_VERSION_KEY = 'schema_version';
export const CURRENT_SCHEMA_VERSION = 4;

export function getStoredSchemaVersion() {
  const version = storage.getString(SCHEMA_VERSION_KEY);
  if (!version) {
    return 0;
  }
  const parsed = Number(version);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function setStoredSchemaVersion(version: number) {
  storage.set(SCHEMA_VERSION_KEY, String(version));
}

function defaultSettings(): SettingsState {
  return {
    theme: 'system',
    language: 'English',
    currency: 'USD',
  };
}

function defaultPeople(): PeopleState {
  return { people: initialPeople };
}

function defaultEvents(): EventsState {
  return {
    events: initialEvents,
    paymentsByEvent: {},
  };
}

function isValidSettings(value: unknown): value is SettingsState {
  if (!value || typeof value !== 'object') return false;
  const data = value as SettingsState;
  return (
    (data.theme === 'light' || data.theme === 'dark' || data.theme === 'system') &&
    typeof data.language === 'string' &&
    typeof data.currency === 'string'
  );
}

function isValidPeople(value: unknown): value is PeopleState {
  if (!value || typeof value !== 'object') return false;
  const data = value as PeopleState;
  return Array.isArray(data.people);
}

function isValidEvents(value: unknown): value is EventsState {
  if (!value || typeof value !== 'object') return false;
  const data = value as EventsState;
  return Array.isArray(data.events) && typeof data.paymentsByEvent === 'object';
}

function migrateV0toV1() {
  try {
    const settings = readJSON<SettingsState>('settings');
    writeJSON('settings', isValidSettings(settings) ? settings : defaultSettings());
  } catch (error) {
    console.error('[MMKV] settings migration failed', error);
    writeJSON('settings', defaultSettings());
  }

  try {
    const people = readJSON<PeopleState>('people');
    const resolved = isValidPeople(people) ? people : defaultPeople();
    writeJSON('people', resolved.people);
  } catch (error) {
    console.error('[MMKV] people migration failed', error);
    writeJSON('people', defaultPeople().people);
  }

  try {
    const events = readJSON<EventsState>('events');
    const resolved = isValidEvents(events) ? events : defaultEvents();
    writeJSON('events', resolved);
  } catch (error) {
    console.error('[MMKV] events migration failed', error);
    writeJSON('events', defaultEvents());
  }
}

function migrateV1toV2() {
  try {
    const events = readJSON<EventsState>('events');
    if (!events || typeof events !== 'object' || !Array.isArray(events.events)) {
      writeJSON('events', defaultEvents());
      return;
    }

    writeJSON('events', events);
  } catch (error) {
    console.error('[MMKV] events v2 migration failed', error);
    writeJSON('events', defaultEvents());
  }
}

function migrateV2toV3() {
  try {
    const events = readJSON<EventsState>('events');
    if (!events || typeof events !== 'object' || !Array.isArray(events.events)) {
      writeJSON('events', defaultEvents());
      return;
    }

    const legacy = events as EventsState & {
      paidSimplifiedByEvent?: Record<string, string[]>;
      paidDetailedByEvent?: Record<string, string[]>;
      paymentsByEvent?: Record<string, Array<{ id: string; fromId: string; toId: string; amount: number }>>;
    };

    writeJSON('events', {
      events: legacy.events,
      paymentsByEvent:
        typeof legacy.paymentsByEvent === 'object' && legacy.paymentsByEvent
          ? legacy.paymentsByEvent
          : {},
    });
  } catch (error) {
    console.error('[MMKV] events v3 migration failed', error);
    writeJSON('events', defaultEvents());
  }
}

function migrateV3toV4() {
  try {
    const events = readJSON<EventsState>('events');
    if (!events || typeof events !== 'object' || !Array.isArray(events.events)) {
      writeJSON('events', defaultEvents());
      return;
    }

    const normalizedPaymentsByEvent = Object.entries(events.paymentsByEvent ?? {}).reduce<
      EventsState['paymentsByEvent']
    >((acc, [eventId, payments]) => {
      const normalized = Array.isArray(payments)
        ? payments
            .filter((payment) => !!payment && typeof payment === 'object')
            .map((payment) => {
              const fromId = (payment as { fromId?: string }).fromId;
              const toId = (payment as { toId?: string }).toId;
              const amount = (payment as { amount?: number }).amount;
              if (!fromId || !toId || !Number.isFinite(amount)) {
                return null;
              }

              return {
                id: (payment as { id?: string }).id ?? `payment-migrated-${eventId}-${fromId}-${toId}`,
                eventId,
                fromId,
                toId,
                amount: amount as number,
                createdAt:
                  (payment as { createdAt?: string }).createdAt ?? new Date(0).toISOString(),
                source:
                  (payment as { source?: 'detailed' | 'simplified' }).source ?? 'detailed',
              };
            })
            .filter((payment): payment is NonNullable<typeof payment> => payment !== null)
        : [];

      acc[eventId] = normalized;
      return acc;
    }, {});

    writeJSON('events', {
      events: events.events,
      paymentsByEvent: normalizedPaymentsByEvent,
    });
  } catch (error) {
    console.error('[MMKV] events v4 migration failed', error);
    writeJSON('events', defaultEvents());
  }
}

export function runMigrations() {
  let version = getStoredSchemaVersion();
  if (version === CURRENT_SCHEMA_VERSION) {
    return;
  }

  try {
    while (version < CURRENT_SCHEMA_VERSION) {
      if (version === 0) {
        migrateV0toV1();
      }
      if (version === 1) {
        migrateV1toV2();
      }
      if (version === 2) {
        migrateV2toV3();
      }
      if (version === 3) {
        migrateV3toV4();
      }
      version += 1;
    }
    setStoredSchemaVersion(CURRENT_SCHEMA_VERSION);
  } catch (error) {
    console.error('[MMKV] migration failed', error);
    setStoredSchemaVersion(CURRENT_SCHEMA_VERSION);
    writeJSON('settings', defaultSettings());
    writeJSON('people', defaultPeople().people);
    writeJSON('events', defaultEvents());
  }
}

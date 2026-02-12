import { createDefaultEventsState, createDefaultPeopleState, createDefaultSettingsState } from '../defaultState';
import { EventsState } from '../events/eventsTypes';
import { PeopleState } from '../people/peopleTypes';
import { SettingsState } from '../settings/settingsTypes';
import { readJSON, storage, writeJSON } from './mmkv';
import { parseEventsState, parsePeopleState, parseSettingsState } from './guards';
import { STORAGE_KEYS } from './storageKeys';

export const CURRENT_SCHEMA_VERSION = 4;

export function getStoredSchemaVersion() {
  const version = storage.getString(STORAGE_KEYS.schemaVersion);
  if (!version) {
    return 0;
  }
  const parsed = Number(version);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function setStoredSchemaVersion(version: number) {
  storage.set(STORAGE_KEYS.schemaVersion, String(version));
}

function migrateV0toV1() {
  try {
    const settings = readJSON<SettingsState>(STORAGE_KEYS.settings);
    writeJSON(STORAGE_KEYS.settings, parseSettingsState(settings));
  } catch (error) {
    console.error('[MMKV] settings migration failed', error);
    writeJSON(STORAGE_KEYS.settings, createDefaultSettingsState());
  }

  try {
    const people = readJSON<PeopleState>(STORAGE_KEYS.people);
    const resolved = parsePeopleState(people);
    writeJSON(STORAGE_KEYS.people, resolved.people);
  } catch (error) {
    console.error('[MMKV] people migration failed', error);
    writeJSON(STORAGE_KEYS.people, createDefaultPeopleState().people);
  }

  try {
    const events = readJSON<EventsState>(STORAGE_KEYS.events);
    writeJSON(STORAGE_KEYS.events, parseEventsState(events));
  } catch (error) {
    console.error('[MMKV] events migration failed', error);
    writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
  }
}

function migrateV1toV2() {
  try {
    const events = readJSON<EventsState>(STORAGE_KEYS.events);
    if (!events || typeof events !== 'object' || !Array.isArray(events.events)) {
      writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
      return;
    }

    writeJSON(STORAGE_KEYS.events, parseEventsState(events));
  } catch (error) {
    console.error('[MMKV] events v2 migration failed', error);
    writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
  }
}

function migrateV2toV3() {
  try {
    const events = readJSON<EventsState>(STORAGE_KEYS.events);
    if (!events || typeof events !== 'object' || !Array.isArray(events.events)) {
      writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
      return;
    }

    const legacy = events as EventsState & {
      paidSimplifiedByEvent?: Record<string, string[]>;
      paidDetailedByEvent?: Record<string, string[]>;
      paymentsByEvent?: Record<string, Array<{ id: string; fromId: string; toId: string; amount: number }>>;
    };

    writeJSON(STORAGE_KEYS.events, {
      events: legacy.events,
      paymentsByEvent:
        typeof legacy.paymentsByEvent === 'object' && legacy.paymentsByEvent
          ? legacy.paymentsByEvent
          : {},
    });
  } catch (error) {
    console.error('[MMKV] events v3 migration failed', error);
    writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
  }
}

function migrateV3toV4() {
  try {
    const events = readJSON<EventsState>(STORAGE_KEYS.events);
    if (!events || typeof events !== 'object' || !Array.isArray(events.events)) {
      writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
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

    writeJSON(STORAGE_KEYS.events, {
      events: events.events,
      paymentsByEvent: normalizedPaymentsByEvent,
    });
  } catch (error) {
    console.error('[MMKV] events v4 migration failed', error);
    writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
  }
}

export function runMigrations() {
  let version = getStoredSchemaVersion();
  if (version === CURRENT_SCHEMA_VERSION) {
    return;
  }
  if (version > CURRENT_SCHEMA_VERSION) {
    setStoredSchemaVersion(CURRENT_SCHEMA_VERSION);
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
    writeJSON(STORAGE_KEYS.settings, createDefaultSettingsState());
    writeJSON(STORAGE_KEYS.people, createDefaultPeopleState().people);
    writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
  }
}

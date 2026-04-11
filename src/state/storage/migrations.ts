import {
  createDefaultEventsState,
  createDefaultPeopleState,
  createDefaultSettingsState,
} from '@/state/defaultState';
import { EventsState } from '@/state/events/eventsTypes';
import { PeopleState } from '@/state/people/peopleTypes';
import { SettingsState } from '@/state/settings/settingsTypes';
import { parseEventsState, parsePeopleState, parseSettingsState } from '@/state/storage/guards';
import { readJSON, storage, writeJSON } from '@/state/storage/mmkv';
import { STORAGE_KEYS } from '@/state/storage/storageKeys';

export const CURRENT_SCHEMA_VERSION = 2;

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

function migrateToSchema2(state: any): any {
  if (!state || !Array.isArray(state.events)) {
    return state;
  }

  const migratedEvents = state.events.map((event: any) => {
    return {
      ...event,
      expenses: event.expenses.map((exp: any) => {
        if ('amount' in exp && !('amountMinor' in exp)) {
          const { amount, ...rest } = exp;
          return {
            ...rest,
            amountMinor: Math.round(amount * 100),
          };
        }
        return exp;
      }),
    };
  });

  const migratedPaymentsByEvent = { ...(state.paymentsByEvent || {}) };
  Object.keys(migratedPaymentsByEvent).forEach((eventId) => {
    const payments = migratedPaymentsByEvent[eventId];
    if (Array.isArray(payments)) {
      migratedPaymentsByEvent[eventId] = payments.map((payment: any) => {
        if ('amount' in payment && !('amountMinor' in payment)) {
          const { amount, ...rest } = payment;
          return {
            ...rest,
            amountMinor: Math.round(amount * 100),
          };
        }
        return payment;
      });
    }
  });

  return {
    ...state,
    events: migratedEvents,
    paymentsByEvent: migratedPaymentsByEvent,
  };
}

function createBackups() {
  try {
    const rawSettings = storage.getString(STORAGE_KEYS.settings);
    const rawPeople = storage.getString(STORAGE_KEYS.people);
    const rawEvents = storage.getString(STORAGE_KEYS.events);

    if (rawSettings) storage.set(STORAGE_KEYS.backupSettings, rawSettings);
    if (rawPeople) storage.set(STORAGE_KEYS.backupPeople, rawPeople);
    if (rawEvents) storage.set(STORAGE_KEYS.backupEvents, rawEvents);
  } catch (error) {
    console.error('[MMKV] Backup failed before migration', error);
  }
}

function migrateToCurrentSchema() {
  const version = getStoredSchemaVersion();

  // Settings
  try {
    const settings = readJSON<SettingsState>(STORAGE_KEYS.settings);
    if (settings) {
      writeJSON(STORAGE_KEYS.settings, parseSettingsState(settings));
    }
  } catch (error) {
    console.error('[MMKV] settings migration failed', error);
    // Don't overwrite settings - let the app try to use existing corrupted data with guards
  }

  // People
  try {
    const people = readJSON<PeopleState>(STORAGE_KEYS.people);
    if (people) {
      const normalizedPeople = parsePeopleState(people);
      writeJSON(STORAGE_KEYS.people, normalizedPeople.people);
    }
  } catch (error) {
    console.error('[MMKV] people migration failed', error);
  }

  // Events
  try {
    let events = readJSON<any>(STORAGE_KEYS.events);
    if (events) {
      if (version < 2) {
        events = migrateToSchema2(events);
      }
      writeJSON(STORAGE_KEYS.events, parseEventsState(events));
    }
  } catch (error) {
    console.error('[MMKV] events migration failed', error);
  }
}

export function runMigrations() {
  const version = getStoredSchemaVersion();
  if (version === CURRENT_SCHEMA_VERSION) {
    return;
  }

  try {
    // 1. Create safety backup of raw data
    createBackups();

    // 2. Perform the actual data transformations
    migrateToCurrentSchema();

    // 3. Mark the schema version as updated ONLY on success
    setStoredSchemaVersion(CURRENT_SCHEMA_VERSION);
    console.log(`[MMKV] Migration to version ${CURRENT_SCHEMA_VERSION} completed successfully.`);
  } catch (error) {
    // CRITICAL: If the top-level migration fails, WE DO NOT OVERWRITE THE STORAGE WITH DEFAULTS.
    // We leave the data as is, possibly causing errors in the app, but preventing permanent data destruction.
    console.error('[MMKV] migration failed. Data preserved.', error);
  }
}

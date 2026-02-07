import { initialEvents } from '../../features/events/data/initialEvents';
import { initialPeople } from '../../features/people/data/initialPeople';
import { EventsState } from '../events/eventsTypes';
import { PeopleState } from '../people/peopleTypes';
import { SettingsState } from '../settings/settingsTypes';
import { readJSON, storage, writeJSON } from './mmkv';

const SCHEMA_VERSION_KEY = 'schema_version';
export const CURRENT_SCHEMA_VERSION = 1;

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
    paidSimplifiedByEvent: {},
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
  return Array.isArray(data.events) && typeof data.paidSimplifiedByEvent === 'object';
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

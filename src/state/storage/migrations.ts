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

export const CURRENT_SCHEMA_VERSION = 1;

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

function migrateToCurrentSchema() {
  try {
    const settings = readJSON<SettingsState>(STORAGE_KEYS.settings);
    writeJSON(STORAGE_KEYS.settings, parseSettingsState(settings));
  } catch (error) {
    console.error('[MMKV] settings migration failed', error);
    writeJSON(STORAGE_KEYS.settings, createDefaultSettingsState());
  }

  try {
    const people = readJSON<PeopleState>(STORAGE_KEYS.people);
    const normalizedPeople = parsePeopleState(people);
    writeJSON(STORAGE_KEYS.people, normalizedPeople.people);
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

export function runMigrations() {
  const version = getStoredSchemaVersion();
  if (version === CURRENT_SCHEMA_VERSION) {
    return;
  }

  try {
    migrateToCurrentSchema();
    setStoredSchemaVersion(CURRENT_SCHEMA_VERSION);
  } catch (error) {
    console.error('[MMKV] migration failed', error);
    writeJSON(STORAGE_KEYS.settings, createDefaultSettingsState());
    writeJSON(STORAGE_KEYS.people, createDefaultPeopleState().people);
    writeJSON(STORAGE_KEYS.events, createDefaultEventsState());
    setStoredSchemaVersion(CURRENT_SCHEMA_VERSION);
  }
}

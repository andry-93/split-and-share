import { createDefaultEventsState } from '@/state/defaultState';
import { parseEventsState } from '@/state/storage/guards';
import { readJSON, writeJSON } from '@/state/storage/mmkv';
import { STORAGE_KEYS } from '@/state/storage/storageKeys';
import { EventsState } from '@/state/events/eventsTypes';

export function initEventsState(): EventsState {
  const persistedEvents = readJSON<unknown>(STORAGE_KEYS.events);
  if (persistedEvents === null) {
    return createDefaultEventsState();
  }

  return parseEventsState(persistedEvents);
}

export function persistEvents(state: EventsState) {
  writeJSON(STORAGE_KEYS.events, state);
}

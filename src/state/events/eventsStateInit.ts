import { createDefaultEventsState } from '@/state/defaultState';
import { parseEventsState } from '@/state/storage/guards';
import { readJSON, writeJSON } from '@/state/storage/mmkv';
import { STORAGE_KEYS } from '@/state/storage/storageKeys';
import { EventsState } from '@/state/events/eventsTypes';

export function initEventsState(): EventsState {
  const persistedEvents = readJSON<unknown>(STORAGE_KEYS.events);
  const parsed = parseEventsState(persistedEvents);
  const defaultState = createDefaultEventsState();
  if (defaultState.groups.length === 0 && defaultState.events.length === 0) {
    return parsed;
  }

  const mergedGroups = [
    ...parsed.groups,
    ...defaultState.groups.filter(
      (seedGroup) => !parsed.groups.some((group) => group.id === seedGroup.id),
    ),
  ];

  const mergedEvents = [
    ...parsed.events,
    ...defaultState.events.filter(
      (seedEvent) => !parsed.events.some((event) => event.id === seedEvent.id),
    ),
  ];

  return {
    ...parsed,
    groups: mergedGroups,
    events: mergedEvents,
  };
}

export function persistEvents(state: EventsState) {
  writeJSON(STORAGE_KEYS.events, state);
}


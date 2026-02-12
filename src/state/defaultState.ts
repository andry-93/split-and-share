import { initialEvents } from '../features/events/data/initialEvents';
import { initialPeople } from '../features/people/data/initialPeople';
import { EventsState } from './events/eventsTypes';
import { PeopleState } from './people/peopleTypes';
import { SettingsState } from './settings/settingsTypes';

export function createDefaultSettingsState(): SettingsState {
  return {
    theme: 'system',
    language: 'English',
    currency: 'USD',
  };
}

export function createDefaultPeopleState(): PeopleState {
  return {
    people: initialPeople,
  };
}

export function createDefaultEventsState(): EventsState {
  return {
    events: initialEvents,
    paymentsByEvent: {},
  };
}


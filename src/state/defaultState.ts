import { initialEvents } from '@/features/events/data/initialEvents';
import { initialPeople } from '@/features/people/data/initialPeople';
import { EventsState } from '@/state/events/eventsTypes';
import { PeopleState } from '@/state/people/peopleTypes';
import { getSystemDefaultLanguage } from '@/state/settings/languageDefaults';
import { SettingsState } from '@/state/settings/settingsTypes';

export function createDefaultSettingsState(): SettingsState {
  return {
    theme: 'system',
    language: getSystemDefaultLanguage(),
    languageSource: 'system',
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

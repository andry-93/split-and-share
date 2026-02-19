import { initialEvents } from '@/features/events/data/initialEvents';
import { initialGroups } from '@/features/events/data/initialGroups';
import { initialPeople } from '@/features/people/data/initialPeople';
import { EventsState } from '@/state/events/eventsTypes';
import { PeopleState } from '@/state/people/peopleTypes';
import { getSystemDefaultLanguage } from '@/state/settings/languageDefaults';
import { getSystemDefaultCurrency } from '@/state/settings/currencyDefaults';
import { SettingsState } from '@/state/settings/settingsTypes';

export function createDefaultSettingsState(): SettingsState {
  return {
    theme: 'system',
    language: getSystemDefaultLanguage(),
    languageSource: 'system',
    currency: getSystemDefaultCurrency(),
    currencySource: 'system',
    debtsViewMode: 'simplified',
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
    groups: initialGroups,
    paymentsByEvent: {},
  };
}

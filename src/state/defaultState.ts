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
    numberFormat: 'system',
    currency: getSystemDefaultCurrency(),
    currencySource: 'system',
    debtsViewMode: 'simplified',
    isSecurityEnabled: false,
    isBiometricsEnabled: false,
    masterPasswordHash: null,
    autoLockGracePeriod: 30,
    onboardingCompleted: false,
  };
}

export function createDefaultPeopleState(): PeopleState {
  return {
    people: [
      {
        id: 'person-me',
        name: 'Me',
        isMe: true,
      },
    ],
  };
}

export function createDefaultEventsState(): EventsState {
  return {
    events: [],
    groups: [],
    paymentsByEvent: {},
  };
}

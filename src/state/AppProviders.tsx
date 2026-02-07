import React from 'react';
import { EventsProvider } from './events/eventsContext';
import { PeopleProvider } from './people/peopleContext';
import { SettingsProvider } from './settings/settingsContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <PeopleProvider>
        <EventsProvider>{children}</EventsProvider>
      </PeopleProvider>
    </SettingsProvider>
  );
}

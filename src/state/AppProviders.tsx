import React from 'react';
import { EventsProvider } from '@/state/events/eventsContext';
import { PeopleProvider } from '@/state/people/peopleContext';
import { SettingsProvider } from '@/state/settings/settingsContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <PeopleProvider>
        <EventsProvider>{children}</EventsProvider>
      </PeopleProvider>
    </SettingsProvider>
  );
}

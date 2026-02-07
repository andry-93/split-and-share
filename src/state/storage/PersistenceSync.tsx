import React, { useEffect } from 'react';
import { persistEvents, useEventsState } from '../events/eventsContext';
import { persistPeople, usePeopleState } from '../people/peopleContext';
import { persistSettings, useSettingsState } from '../settings/settingsContext';

export function PersistenceSync({ children }: { children: React.ReactNode }) {
  const eventsState = useEventsState();
  const peopleState = usePeopleState();
  const settingsState = useSettingsState();

  useEffect(() => {
    persistEvents(eventsState);
  }, [eventsState]);

  useEffect(() => {
    persistPeople(peopleState);
  }, [peopleState]);

  useEffect(() => {
    persistSettings(settingsState);
  }, [settingsState]);

  return <>{children}</>;
}

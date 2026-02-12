import React, { useEffect, useRef } from 'react';
import { persistEvents, useEventsState } from '../events/eventsContext';
import { persistPeople, usePeopleState } from '../people/peopleContext';
import { persistSettings, useSettingsState } from '../settings/settingsContext';

export function PersistenceSync({ children }: { children: React.ReactNode }) {
  const eventsState = useEventsState();
  const peopleState = usePeopleState();
  const settingsState = useSettingsState();
  const eventsSerializedRef = useRef<string>('');
  const peopleSerializedRef = useRef<string>('');
  const settingsSerializedRef = useRef<string>('');

  useEffect(() => {
    const serialized = JSON.stringify(eventsState);
    if (eventsSerializedRef.current === serialized) {
      return;
    }
    eventsSerializedRef.current = serialized;
    persistEvents(eventsState);
  }, [eventsState]);

  useEffect(() => {
    const serialized = JSON.stringify(peopleState);
    if (peopleSerializedRef.current === serialized) {
      return;
    }
    peopleSerializedRef.current = serialized;
    persistPeople(peopleState);
  }, [peopleState]);

  useEffect(() => {
    const serialized = JSON.stringify(settingsState);
    if (settingsSerializedRef.current === serialized) {
      return;
    }
    settingsSerializedRef.current = serialized;
    persistSettings(settingsState);
  }, [settingsState]);

  return <>{children}</>;
}

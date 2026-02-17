import React, { useEffect, useRef } from 'react';
import { persistEvents, useEventsState } from '@/state/events/eventsContext';
import { persistPeople, usePeopleState } from '@/state/people/peopleContext';

export function PersistenceSync({ children }: { children: React.ReactNode }) {
  const eventsState = useEventsState();
  const peopleState = usePeopleState();
  const eventsSerializedRef = useRef<string>('');
  const peopleSerializedRef = useRef<string>('');

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

  return <>{children}</>;
}

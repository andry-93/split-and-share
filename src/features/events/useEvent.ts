import { useEffect, useState } from 'react';
import { Event } from '../../entities/types';
import { eventsRepository } from '../../entities/event/event.repository';

export const useEvent = (eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    load();
  }, [eventId]);

  const load = async () => {
    const events = await eventsRepository.getAll();
    setEvent(events.find(e => e.id === eventId) ?? null);
  };

  const updateParticipants = async (participantIds: string[]) => {
    if (!event) return;

    const updated: Event = {
      ...event,
      participantIds,
    };

    setEvent(updated);
    await eventsRepository.update(updated);
  };

  return {
    event,
    updateParticipants,
  };
};

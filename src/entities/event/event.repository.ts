import { Event } from '../types';
import { storage } from '@/shared/lib/storage';

const EVENTS_KEY = 'events';

export const eventsRepository = {
    getAll(): Event[] {
        return storage.get<Event[]>(EVENTS_KEY) ?? [];
    },

    saveAll(events: Event[]): void {
        storage.set(EVENTS_KEY, events);
    },

    update(updatedEvent: Event): void {
        const events = this.getAll();
        const updated = events.map(e =>
            e.id === updatedEvent.id ? updatedEvent : e
        );
        this.saveAll(updated);
    },
};


import { Event } from '../types';
import { storage } from '../../shared/lib/storage';

const EVENTS_KEY = 'events';

export const eventsRepository = {
    async getAll(): Promise<Event[]> {
        const events =
            (await storage.get<Event[]>(EVENTS_KEY)) ?? [];

        let changed = false;

        const migrated = events.map(event => {
            if (!('currency' in event)) {
                changed = true;
                return {
                    ...event,
                    currency: undefined,
                };
            }
            return event;
        });

        if (changed) {
            await storage.set(EVENTS_KEY, migrated);
        }

        return migrated;
    },

    async saveAll(events: Event[]): Promise<void> {
        await storage.set(EVENTS_KEY, events);
    },

    async update(event: Event): Promise<void> {
        const events = await this.getAll();
        const updated = events.map(e =>
            e.id === event.id ? event : e
        );
        await this.saveAll(updated);
    },
};

import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Event } from '../../entities/types';
import { eventsRepository } from '../../entities/event/event.repository';
import { nanoid } from 'nanoid/non-secure';

export const useEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    /* =======================
       LOAD
       ======================= */

    const loadEvents = useCallback(async () => {
        const data = await eventsRepository.getAll();
        setEvents(data);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadEvents();
        }, [loadEvents])
    );

    /* =======================
       CREATE
       ======================= */

    const createEvent = async (title: string) => {
        const newEvent: Event = {
            id: nanoid(),
            title,
            participantIds: [],
            currency: 'BYN',
            createdAt: Date.now(),
        };

        const updated = [newEvent, ...events];
        setEvents(updated);
        await eventsRepository.saveAll(updated);
    };

    /* =======================
       UPDATE
       ======================= */

    const updateEvent = async (
        id: string,
        patch: Partial<Event>
    ) => {
        const updated = events.map(e =>
            e.id === id ? { ...e, ...patch } : e
        );

        setEvents(updated);
        await eventsRepository.saveAll(updated);
    };

    /* =======================
       DELETE
       ======================= */

    const deleteEvent = async (id: string) => {
        const updated = events.filter(e => e.id !== id);
        setEvents(updated);
        await eventsRepository.saveAll(updated);
    };

    const deleteEvents = async (ids: string[]) => {
        const updated = events.filter(
            e => !ids.includes(e.id)
        );
        setEvents(updated);
        await eventsRepository.saveAll(updated);
    };

    /* =======================
       DERIVED ACCESS
       ======================= */

    const getEventById = useCallback(
        (id: string) => {
            return events.find(e => e.id === id);
        },
        [events]
    );

    /* =======================
       🔥 PUBLIC RELOAD
       ======================= */

    return {
        events,
        loading,
        getEventById,
        createEvent,
        updateEvent,
        deleteEvent,
        deleteEvents,
        reloadEvents: loadEvents,
    };
};

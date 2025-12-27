import { useEffect } from 'react';
import { updateEvent as updateEventAction } from '@/store/slices/events.slice';
import { eventsRepository } from '@/entities/event/event.repository';
import {
    addEvent,
    removeEvent,
    setEvents,
    setActiveEvent,
} from '@/store/slices/events.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectEvents, selectActiveEvent } from '@/store/selectors/events.selectors';
import { nanoid } from 'nanoid/non-secure';
import { Event } from '@/entities/types';

export const useEvents = () => {
    const dispatch = useAppDispatch();
    const events = useAppSelector(selectEvents);
    const activeEvent = useAppSelector(selectActiveEvent);

    /* ========= LOAD ON START ========= */
    useEffect(() => {
        eventsRepository.getAll().then(stored => {
            dispatch(setEvents(stored));
        });
    }, [dispatch]);

    /* ========= CREATE ========= */
    const createEvent = async (title: string) => {
        const event: Event = {
            id: nanoid(),
            title: title.trim(),
            createdAt: Date.now(),
            participantIds: [],
            currency: undefined,
        };

        const next = [...events, event];
        await eventsRepository.saveAll(next);
        dispatch(addEvent(event));
    };

    const updateEvent = async (
        eventId: string,
        changes: Partial<Event>
    ) => {
        const current = events.find(
            e => e.id === eventId
        );

        if (!current) return;

        const updated: Event = {
            ...current,
            ...changes,
        };

        const next = events.map(e =>
            e.id === eventId ? updated : e
        );

        await eventsRepository.saveAll(next);
        dispatch(
            updateEventAction({
                id: eventId,
                changes,
            })
        );
    };

    /* ========= DELETE ONE ========= */
    const deleteEvent = async (id: string) => {
        const next = events.filter(e => e.id !== id);
        await eventsRepository.saveAll(next);
        dispatch(removeEvent(id));
    };

    /* ========= DELETE MANY ========= */
    const deleteEvents = async (ids: string[]) => {
        const idSet = new Set(ids);
        const next = events.filter(e => !idSet.has(e.id));
        await eventsRepository.saveAll(next);
        ids.forEach(id => dispatch(removeEvent(id)));
    };

    return {
        events,
        activeEvent,
        createEvent,
        deleteEvent,
        deleteEvents,
        updateEvent,
        openEvent: (id: string) =>
            dispatch(setActiveEvent(id)),
        closeEvent: () =>
            dispatch(setActiveEvent(null)),
    };
};

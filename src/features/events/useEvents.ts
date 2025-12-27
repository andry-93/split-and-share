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
import { selectExpenses } from '@/store/selectors/expenses.selectors';
import { expensesRepository } from '@/entities/expense/expense.repository';
import { removeExpense } from '@/store/slices/expenses.slice';

export const useEvents = () => {
    const dispatch = useAppDispatch();
    const events = useAppSelector(selectEvents);
    const activeEvent = useAppSelector(selectActiveEvent);
    const allExpenses = useAppSelector(selectExpenses);

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
    const deleteEvent = async (eventId: string) => {
        /* ===== EVENTS ===== */
        const nextEvents = events.filter(
            e => e.id !== eventId
        );
        await eventsRepository.saveAll(nextEvents);
        dispatch(removeEvent(eventId));

        /* ===== EXPENSES (CASCADE) ===== */
        const remainingExpenses = allExpenses.filter(
            e => e.eventId !== eventId
        );

        if (
            remainingExpenses.length !==
            allExpenses.length
        ) {
            await expensesRepository.saveAll(
                remainingExpenses
            );

            allExpenses
                .filter(e => e.eventId === eventId)
                .forEach(e =>
                    dispatch(removeExpense(e.id))
                );
        }
    };

    /* ========= DELETE MANY ========= */
    const deleteEvents = async (ids: string[]) => {
        const idSet = new Set(ids);

        /* EVENTS */
        const nextEvents = events.filter(
            e => !idSet.has(e.id)
        );
        await eventsRepository.saveAll(nextEvents);
        ids.forEach(id => dispatch(removeEvent(id)));

        /* EXPENSES */
        const remainingExpenses = allExpenses.filter(
            e => !idSet.has(e.eventId)
        );
        await expensesRepository.saveAll(
            remainingExpenses
        );

        allExpenses
            .filter(e => idSet.has(e.eventId))
            .forEach(e =>
                dispatch(removeExpense(e.id))
            );
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

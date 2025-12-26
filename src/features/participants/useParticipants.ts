import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Participant } from '../../entities/types';
import { participantsRepository } from '../../entities/participant/participant.repository';
import { eventsRepository } from '../../entities/event/event.repository';
import { expensesRepository } from '../../entities/expense/expense.repository';
import { nanoid } from 'nanoid/non-secure';

export const useParticipants = () => {
    const [participants, setParticipants] = useState<
        Participant[]
    >([]);
    const [loading, setLoading] = useState(true);

    /* =======================
       LOAD
       ======================= */

    const loadParticipants = useCallback(async () => {
        const data = await participantsRepository.getAll();
        setParticipants(data);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadParticipants();
        }, [loadParticipants])
    );

    /* =======================
       CREATE
       ======================= */

    const createParticipant = async (
        name: string,
        avatarUri?: string
    ) => {
        const newParticipant: Participant = {
            id: nanoid(),
            name,
            avatarUri,
        };

        const updated = [...participants, newParticipant];
        setParticipants(updated);
        await participantsRepository.saveAll(updated);
    };

    /* =======================
       UPDATE
       ======================= */

    const updateParticipant = async (
        id: string,
        data: Partial<Participant>
    ) => {
        const updated = participants.map(p =>
            p.id === id ? { ...p, ...data } : p
        );

        setParticipants(updated);
        await participantsRepository.saveAll(updated);
    };

    /* =======================
       DELETE + SYNC
       ======================= */

    const deleteParticipants = async (ids: string[]) => {
        /* ===== 1. PARTICIPANTS ===== */
        const updatedParticipants = participants.filter(
            p => !ids.includes(p.id)
        );
        setParticipants(updatedParticipants);
        await participantsRepository.saveAll(updatedParticipants);

        /* ===== 2. EVENTS ===== */
        const events = await eventsRepository.getAll();
        const updatedEvents = events.map(event => ({
            ...event,
            participantIds: event.participantIds.filter(
                id => !ids.includes(id)
            ),
        }));
        await eventsRepository.saveAll(updatedEvents);

        /* ===== 3. EXPENSES ===== */
        const allExpenses = await expensesRepository.getAll();
        const filteredExpenses = allExpenses.filter(
            e => !ids.includes(e.paidBy)
        );
        await expensesRepository.saveAll(filteredExpenses);

        return {
            updatedParticipants,
            updatedEvents,
            filteredExpenses,
        };
    };

    return {
        participants,
        loading,
        createParticipant,
        updateParticipant,
        deleteParticipants,
    };
};

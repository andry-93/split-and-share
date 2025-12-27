import { useEffect } from 'react';
import { nanoid } from 'nanoid/non-secure';

import { Participant } from '@/entities/types';
import { participantsRepository } from '@/entities/participant/participant.repository';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    addParticipant,
    removeParticipant,
    setParticipants,
    updateParticipant as updateParticipantAction,
} from '@/store/slices/participants.slice';
import { selectParticipants } from '@/store/selectors/participants.selectors';
import { useEvents } from '@/features/events/useEvents';

export const useParticipants = () => {
    const dispatch = useAppDispatch();
    const participants = useAppSelector(
        selectParticipants
    );

    /* ========= LOAD ========= */
    useEffect(() => {
        participantsRepository
            .getAll()
            .then(stored => {
                dispatch(setParticipants(stored));
            });
    }, [dispatch]);

    /* ========= CREATE ========= */
    const createParticipant = async (
        name: string,
        avatarUri?: string
    ) => {
        const participant: Participant = {
            id: nanoid(),
            name,
            avatarUri,
        };

        const next = [...participants, participant];
        await participantsRepository.saveAll(next);
        dispatch(addParticipant(participant));
    };

    /* ========= UPDATE ========= */
    const updateParticipant = async (
        id: string,
        changes: Partial<Participant>
    ) => {
        const current = participants.find(
            p => p.id === id
        );
        if (!current) return;

        const updated: Participant = {
            ...current,
            ...changes,
        };

        const next = participants.map(p =>
            p.id === id ? updated : p
        );

        await participantsRepository.saveAll(next);
        dispatch(
            updateParticipantAction({ id, changes })
        );
    };

    /* ========= DELETE ONE ========= */
    const { events, updateEvent } = useEvents();

    const deleteParticipant = async (id: string) => {
        // 1️⃣ удалить participant из participants
        const nextParticipants = participants.filter(
            p => p.id !== id
        );
        await participantsRepository.saveAll(
            nextParticipants
        );
        dispatch(removeParticipant(id));

        // 2️⃣ убрать participantId из ВСЕХ events
        for (const event of events) {
            if (event.participantIds.includes(id)) {
                updateEvent(event.id, {
                    participantIds:
                        event.participantIds.filter(
                            pid => pid !== id
                        ),
                });
            }
        }
    };

    /* ========= DELETE MANY ========= */
    const deleteParticipants = async (ids: string[]) => {
        const idSet = new Set(ids);

        // 1️⃣ participants
        const nextParticipants = participants.filter(
            p => !idSet.has(p.id)
        );
        await participantsRepository.saveAll(
            nextParticipants
        );
        ids.forEach(id =>
            dispatch(removeParticipant(id))
        );

        // 2️⃣ events
        for (const event of events) {
            const nextIds = event.participantIds.filter(
                pid => !idSet.has(pid)
            );

            if (
                nextIds.length !==
                event.participantIds.length
            ) {
                updateEvent(event.id, {
                    participantIds: nextIds,
                });
            }
        }
    };

    return {
        participants,
        createParticipant,
        updateParticipant,
        deleteParticipant,
        deleteParticipants,
    };
};

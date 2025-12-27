import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Participant } from '@/entities/types';
import { selectParticipants } from '@/store/selectors/participants.selectors';

export const useParticipantsReadonly = (
    participantIds?: string[]
): Participant[] => {
    const participants = useAppSelector(
        selectParticipants
    );

    return useMemo(() => {
        if (!participantIds) {
            return participants;
        }

        const idSet = new Set(participantIds);

        return participants.filter(p =>
            idSet.has(p.id)
        );
    }, [participants, participantIds?.join(',')]);
};

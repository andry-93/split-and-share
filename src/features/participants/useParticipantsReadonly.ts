import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Participant } from '../../entities/types';
import { participantsRepository } from '../../entities/participant/participant.repository';

export const useParticipantsReadonly = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);

    const load = async () => {
        const data = await participantsRepository.getAll();
        setParticipants(data);
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    return participants;
};

import { Participant } from '../types';
import {storage} from "@/shared/lib/storage";

const PARTICIPANTS_KEY = 'participants';

export const participantsRepository = {
    getAll(): Participant[] {
        return storage.get<Participant[]>(PARTICIPANTS_KEY) ?? [];
    },

    saveAll(participants: Participant[]): void {
        const unique = Array.from(
            new Map(participants.map(p => [p.id, p])).values()
        );
        storage.set(PARTICIPANTS_KEY, unique);
    },
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Participant } from '../types';

const KEY = 'participants';

type LegacyParticipant = Participant & {
    avatar?: string;
};

export const participantsRepository = {
    async getAll(): Promise<Participant[]> {
        const raw = await AsyncStorage.getItem(KEY);
        if (!raw) return [];

        const parsed: LegacyParticipant[] = JSON.parse(raw);

        let migrated = false;

        const normalized: Participant[] = parsed.map(p => {
            // already new format
            if (p.avatarUri !== undefined) {
                return p;
            }

            // migrate legacy avatar → avatarUri
            if (p.avatar) {
                migrated = true;
                const { avatar, ...rest } = p;

                return {
                    ...rest,
                    avatarUri: avatar,
                };
            }

            return p;
        });

        // save back only if migration happened
        if (migrated) {
            await AsyncStorage.setItem(
                KEY,
                JSON.stringify(normalized)
            );
        }

        return normalized;
    },

    async saveAll(participants: Participant[]) {
        await AsyncStorage.setItem(
            KEY,
            JSON.stringify(participants)
        );
    },
};

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Participant } from '@/entities/types';

import {
    selectParticipants,
} from './participants.selectors';
import {
    selectParticipantsSearch,
    selectParticipantsSort,
} from './ui.selectors';

export type ParticipantsSection = {
    title: string;
    data: Participant[];
};

/* =======================
   HELPERS
   ======================= */

const normalize = (v: string) =>
    v.trim().toLowerCase();

/* =======================
   SELECTOR
   ======================= */

export const selectFilteredSortedParticipants =
    createSelector(
        [
            selectParticipants,
            selectParticipantsSearch,
            selectParticipantsSort,
        ],
        (
            participants,
            search,
            sort
        ): Participant[] => {
            let list = [...participants];

            /* ===== SEARCH ===== */
            const q = normalize(search);
            if (q) {
                list = list.filter(p =>
                    normalize(p.name).includes(q)
                );
            }

            /* ===== SORT ===== */
            switch (sort) {
                case 'name_desc':
                    list.sort((a, b) =>
                        b.name.localeCompare(a.name)
                    );
                    break;

                case 'name_asc':
                default:
                    list.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );
            }

            return list;
        }
    );

export const selectParticipantsSections =
    createSelector(
        [selectFilteredSortedParticipants],
        (participants): ParticipantsSection[] => {
            const map: Record<string, Participant[]> =
                {};

            participants.forEach(p => {
                const first =
                    p.name.trim()[0]?.toUpperCase();
                const letter =
                    first && first.match(/[A-ZА-Я]/)
                        ? first
                        : '#';

                if (!map[letter]) map[letter] = [];
                map[letter].push(p);
            });

            return Object.keys(map)
                .sort()
                .map(letter => ({
                    title: letter,
                    data: map[letter],
                }));
        }
    );

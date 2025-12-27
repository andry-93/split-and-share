import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Event } from '@/entities/types';

import {
    selectEvents,
} from './events.selectors';
import {
    selectExpenses,
} from './expenses.selectors';
import {
    selectEventsSearch,
    selectEventsSort,
    selectEventsFilterHasExpenses,
} from './ui.selectors';

/* =======================
   HELPERS
   ======================= */

const normalize = (v: string) =>
    v.trim().toLowerCase();

/* =======================
   SELECTOR
   ======================= */

export const selectFilteredSortedEvents =
    createSelector(
        [
            selectEvents,
            selectExpenses,
            selectEventsSearch,
            selectEventsSort,
            selectEventsFilterHasExpenses,
        ],
        (
            events,
            expenses,
            search,
            sort,
            filterHasExpenses
        ): Event[] => {
            let list = [...events];

            /* ===== FILTER: HAS EXPENSES ===== */
            if (filterHasExpenses) {
                const eventIdsWithExpenses = new Set(
                    expenses.map(e => e.eventId)
                );

                list = list.filter(e =>
                    eventIdsWithExpenses.has(e.id)
                );
            }

            /* ===== SEARCH ===== */
            const q = normalize(search);
            if (q) {
                list = list.filter(e =>
                    normalize(e.title).includes(q)
                );
            }

            /* ===== SORT ===== */
            switch (sort) {
                case 'title_asc':
                    list.sort((a, b) =>
                        a.title.localeCompare(b.title)
                    );
                    break;

                case 'title_desc':
                    list.sort((a, b) =>
                        b.title.localeCompare(a.title)
                    );
                    break;

                /* created_* — только если есть поле */
                case 'created_asc':
                    list.sort(
                        (a, b) =>
                            (a as any).createdAt -
                            (b as any).createdAt
                    );
                    break;

                case 'created_desc':
                    list.sort(
                        (a, b) =>
                            (b as any).createdAt -
                            (a as any).createdAt
                    );
                    break;
            }

            return list;
        }
    );

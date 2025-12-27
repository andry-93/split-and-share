import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

import { calculateDebts } from '@/entities/debt/calculateDebts';
import { selectExpenses } from './expenses.selectors';

/**
 * Factory selector, потому что нужен eventId
 */
export const makeSelectDebtsByEvent =
    (eventId: string, participantIds: string[]) =>
        createSelector(
            [selectExpenses],
            expenses => {
                const eventExpenses = expenses.filter(
                    e => e.eventId === eventId
                );

                return calculateDebts(
                    eventExpenses,
                    participantIds
                );
            }
        );

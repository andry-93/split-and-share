import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { selectExpenses } from './expenses.selectors';

export type ParticipantTotals = {
    participantId: string;
    paid: number;
    owes: number;
    balance: number; // paid - owes
};

export const makeSelectTotalsByEvent =
    (eventId: string, participantIds: string[]) =>
        createSelector(
            [selectExpenses],
            expenses => {
                const totals: Record<
                    string,
                    ParticipantTotals
                > = {};

                participantIds.forEach(id => {
                    totals[id] = {
                        participantId: id,
                        paid: 0,
                        owes: 0,
                        balance: 0,
                    };
                });

                const eventExpenses = expenses.filter(
                    e => e.eventId === eventId
                );

                for (const expense of eventExpenses) {
                    const share =
                        expense.amount /
                        participantIds.length;

                    // paid
                    if (totals[expense.paidBy]) {
                        totals[expense.paidBy].paid +=
                            expense.amount;
                    }

                    // owes
                    participantIds.forEach(pid => {
                        if (totals[pid]) {
                            totals[pid].owes += share;
                        }
                    });
                }

                Object.values(totals).forEach(t => {
                    t.balance = t.paid - t.owes;
                });

                return Object.values(totals);
            }
        );

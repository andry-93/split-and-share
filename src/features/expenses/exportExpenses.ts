import { Expense, Participant } from '../../entities/types';
import { toCSV } from '../../shared/lib/csv';
import { exportCsv } from '../../shared/lib/exportCsv';

export const exportExpenses = async (
    expenses: Expense[],
    participants: Participant[],
    eventTitle: string
) => {
    const headers = ['Description', 'Amount', 'Paid by'];

    const rows = expenses.map(e => {
        const payer = participants.find(p => p.id === e.paidBy) ?? null;
        return [
            e.title,
            e.amount.toString(),
            payer?.name ?? '',
        ];
    });

    const csv = toCSV(headers, rows);

    await exportCsv(
        `${eventTitle}-expenses.csv`,
        csv
    );
};

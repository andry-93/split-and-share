import { Debt, Participant } from '../../entities/types';
import { toCSV } from '../../shared/lib/csv';
import { exportCsv } from '../../shared/lib/exportCsv';

export const exportDebts = async (
    debts: Debt[],
    participants: Participant[],
    eventTitle: string
) => {
    const headers = ['From', 'To', 'Amount'];

    const rows = debts.map(d => {
        const from = participants.find(p => p.id === d.from) ?? null;
        const to = participants.find(p => p.id === d.to) ?? null;

        return [
            from?.name ?? '',
            to?.name ?? '',
            d.amount.toString(),
        ];
    });

    const csv = toCSV(headers, rows);

    await exportCsv(`${eventTitle}-debts.csv`, csv);
};

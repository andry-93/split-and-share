import { Debt, Expense } from '../types';

export const calculateDebts = (
    expenses: Expense[],
    participantIds: string[]
): Debt[] => {
    if (participantIds.length === 0) return [];

    // 🔑 фильтруем расходы по актуальным участникам
    const validExpenses = expenses.filter(e =>
        participantIds.includes(e.paidBy)
    );

    if (validExpenses.length === 0) return [];

    const total = validExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
    );

    const share = total / participantIds.length;

    const paidMap: Record<string, number> = {};
    participantIds.forEach(id => (paidMap[id] = 0));

    validExpenses.forEach(e => {
        paidMap[e.paidBy] += e.amount;
    });

    const balance = participantIds.map(id => ({
        id,
        amount: paidMap[id] - share,
    }));

    const creditors = balance.filter(b => b.amount > 0);
    const debtors = balance.filter(b => b.amount < 0);

    const debts: Debt[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(
            -debtor.amount,
            creditor.amount
        );

        debts.push({
            from: debtor.id,
            to: creditor.id,
            amount: Math.round(amount * 100) / 100,
        });

        debtor.amount += amount;
        creditor.amount -= amount;

        if (debtor.amount === 0) i++;
        if (creditor.amount === 0) j++;
    }

    return debts;
};

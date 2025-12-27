import { List } from 'react-native-paper';
import { Debt, Participant } from '@/entities/types';

interface Props {
    debt: Debt;
    participants: Participant[];
}

export const DebtItem = ({ debt, participants }: Props) => {
    const from = participants.find(p => p.id === debt.from) ?? null;
    const to = participants.find(p => p.id === debt.to) ?? null;

    if (!from || !to) return null;

    return (
        <List.Item
            title={`${from.name} owes ${to.name}`}
            description={`${debt.amount} BYN`}
        />
    );
};

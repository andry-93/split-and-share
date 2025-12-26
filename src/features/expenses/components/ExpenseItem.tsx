import React from 'react';
import { IconButton, List, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Expense, Participant } from '../../../entities/types';

interface Props {
    expense: Expense;
    participants: Participant[];
    onEdit: () => void;
    onDelete: () => void;
}

export const ExpenseItem = ({
    expense,
    participants,
    onEdit,
    onDelete,
}: Props) => {
    const { t } = useTranslation();
    const payer = participants.find(
        p => p.id === expense.paidBy
    );

    return (
        <List.Item
            title={expense.description}
            description={() => (
                <>
                    <Text>
                        {t('amount')}: {expense.amount}
                    </Text>
                    <Text>
                        {t('paid_by')}:{' '}
                        {payer ? payer.name : '—'}
                    </Text>
                </>
            )}
            right={() => (
                <>
                    <IconButton
                        icon="pencil"
                        onPress={onEdit}
                    />
                    <IconButton
                        icon="delete"
                        onPress={onDelete}
                    />
                </>
            )}
        />
    );
};

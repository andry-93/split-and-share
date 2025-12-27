import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
    List,
    IconButton,
    Text,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Expense, Participant } from '@/entities/types';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

type Props = {
    expenses: Expense[];
    participants: Participant[];
    currency: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
};

export const ExpensesList = ({
    expenses,
    participants,
    currency,
    onEdit,
    onDelete,
}: Props) => {
    const { t } = useTranslation();
    const format = useCurrencyFormatter();

    const participantsMap = useMemo(() => {
        const map: Record<string, string> = {};
        participants.forEach(p => {
            map[p.id] = p.name;
        });
        return map;
    }, [participants]);

    const safeCurrency =
        currency?.trim() || '';

    if (expenses.length === 0) {
        return (
            <EmptyState
                title={t('no_expenses')}
                description={t('add_first_expense')}
            />
        );
    }

    return (
        <View>
            {expenses.map(expense => (
                <List.Item
                    key={expense.id}
                    title={expense.description}
                    description={
                        participantsMap[
                            expense.paidBy
                            ] ??
                        t('unknown_participant')
                    }
                    right={() => (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            {/* AMOUNT */}
                            <Text
                                variant="titleMedium"
                                style={{
                                    marginRight: 8,
                                    fontWeight: '600',
                                }}
                            >
                                {format(expense.amount, safeCurrency)}
                            </Text>

                            {/* ACTIONS */}
                            <IconButton
                                icon="pencil"
                                onPress={() =>
                                    onEdit(
                                        expense.id
                                    )
                                }
                            />
                            <IconButton
                                icon="delete"
                                onPress={() =>
                                    onDelete(
                                        expense.id
                                    )
                                }
                            />
                        </View>
                    )}
                />
            ))}
        </View>
    );
};

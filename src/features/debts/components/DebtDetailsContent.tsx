import React from 'react';
import { View } from 'react-native';
import {
    Text,
    Divider,
    Button,
    useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Debt, Participant } from '../../../entities/types';

type Props = {
    debt: Debt;
    participants: Participant[];
    currency: string;
    stats: {
        expensesCount: number;
        total: number;
        share: number;
    };
    onClose: () => void;
};

export const DebtDetailsContent = ({
                                       debt,
                                       participants,
                                       currency,
                                       stats,
                                       onClose,
                                   }: Props) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const from =
        participants.find(p => p.id === debt.from)?.name ??
        '—';

    const to =
        participants.find(p => p.id === debt.to)?.name ??
        '—';

    return (
        <View>
            {/* ===== TITLE ===== */}
            <Text
                variant="titleMedium"
                style={{ marginBottom: 12 }}
            >
                {t('debt_details')}
            </Text>

            {/* ===== FROM / TO ===== */}
            <View style={{ marginBottom: 12 }}>
                <Text variant="bodyMedium">
                    <Text
                        style={{
                            color: colors.onSurfaceVariant,
                        }}
                    >
                        {t('from')}:{' '}
                    </Text>
                    {from}
                </Text>

                <Text variant="bodyMedium">
                    <Text
                        style={{
                            color: colors.onSurfaceVariant,
                        }}
                    >
                        {t('to')}:{' '}
                    </Text>
                    {to}
                </Text>
            </View>

            {/* ===== AMOUNT ===== */}
            <Text
                variant="headlineSmall"
                style={{
                    fontWeight: '700',
                    color: colors.primary,
                    marginBottom: 12,
                }}
            >
                {debt.amount.toFixed(2)} {currency}
            </Text>

            <Divider style={{ marginBottom: 12 }} />

            {/* ===== CONTEXT ===== */}
            <View style={{ gap: 6 }}>
                <Text variant="bodySmall">
                    {t('based_on_expenses', {
                        count: stats.expensesCount,
                    })}
                </Text>

                <Text variant="bodySmall">
                    {t('total_spent')}: {stats.total.toFixed(2)}{' '}
                    {currency}
                </Text>

                <Text variant="bodySmall">
                    {t('share_per_person')}:{' '}
                    {stats.share.toFixed(2)} {currency}
                </Text>
            </View>

            {/* ===== ACTIONS ===== */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 20,
                }}
            >
                <Button onPress={onClose}>
                    {t('close')}
                </Button>
            </View>
        </View>
    );
};

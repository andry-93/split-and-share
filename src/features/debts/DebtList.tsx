import React, { useEffect, useMemo } from 'react';
import { View, LayoutAnimation } from 'react-native';
import {
    Card,
    Text,
    Avatar,
    Button,
    useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Debt, Participant } from '@/entities/types';
import { exportDebts } from './exportDebts';
import { useBottomSheet } from '@/shared/ui/bottom-sheet/BottomSheetProvider';
import { DebtDetailsContent } from './components/DebtDetailsContent';

type Props = {
    debts: Debt[];
    participants: Participant[];
    eventTitle: string;
    currency: string;
};

export const DebtList = ({
    debts,
    participants,
    eventTitle,
    currency,
}: Props) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { show, hide } = useBottomSheet();

    /* ===== animate recalculation ===== */
    useEffect(() => {
        LayoutAnimation.configureNext(
            LayoutAnimation.Presets.easeInEaseOut
        );
    }, [debts]);

    const getParticipant = (id: string) =>
        participants.find(p => p.id === id);

    const openDetails = (debt: Debt) => {
        const from = getParticipant(debt.from);
        const to = getParticipant(debt.to);

        const total = debts.reduce((s, d) => s + d.amount, 0);
        const share = total / participants.length;

        show(
            <DebtDetailsContent
                debt={debt}
                participants={participants}
                currency={currency}
                stats={{
                    expensesCount: debts.length,
                    total,
                    share,
                }}
                onClose={hide}
            />,
            { snap: 'auto' }
        );
    };

    if (debts.length === 0) {
        return (
            <Card
                elevation={0}
                style={{
                    marginTop: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.outlineVariant,
                }}
            >
                <Text
                    variant="bodyMedium"
                    style={{ color: colors.onSurfaceVariant }}
                >
                    {t('no_debts')}
                </Text>
            </Card>
        );
    }

    return (
        <View style={{ marginTop: 16 }}>
            {/* HEADER */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                }}
            >
                <Text variant="titleMedium">
                    {t('debts')}
                </Text>

                <Button
                    mode="outlined"
                    icon="file-export"
                    onPress={() =>
                        exportDebts(debts, participants, eventTitle)
                    }
                >
                    {t('export')}
                </Button>
            </View>

            {/* LIST */}
            {debts.map((d, i) => {
                const from = getParticipant(d.from);
                const to = getParticipant(d.to);

                return (
                    <Card
                        key={i}
                        elevation={0}
                        onPress={() => openDetails(d)}
                        style={{
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: colors.outlineVariant,
                        }}
                    >
                        <View
                            style={{
                                padding: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            {/* FROM */}
                            <Avatar.Text
                                size={36}
                                label={from?.name[0] ?? '?'}
                                style={{ backgroundColor: colors.errorContainer }}
                            />

                            <View style={{ flex: 1, marginHorizontal: 8 }}>
                                <Text numberOfLines={1}>
                                    {from?.name}
                                </Text>
                                <Text
                                    variant="bodySmall"
                                    style={{ color: colors.onSurfaceVariant }}
                                >
                                    {t('owes')}
                                </Text>
                            </View>

                            <Text style={{ marginHorizontal: 6 }}>→</Text>

                            <View style={{ flex: 1, marginHorizontal: 8 }}>
                                <Text numberOfLines={1}>
                                    {to?.name}
                                </Text>
                            </View>

                            <Avatar.Text
                                size={36}
                                label={to?.name[0] ?? '?'}
                                style={{
                                    backgroundColor: colors.secondaryContainer,
                                }}
                            />
                        </View>

                        {/* AMOUNT */}
                        <View
                            style={{
                                alignItems: 'flex-end',
                                paddingHorizontal: 16,
                                paddingBottom: 12,
                            }}
                        >
                            <Text
                                variant="titleMedium"
                                style={{
                                    color: colors.primary,
                                    fontWeight: '600',
                                }}
                            >
                                {d.amount.toFixed(2)} {currency}
                            </Text>
                        </View>
                    </Card>
                );
            })}
        </View>
    );
};

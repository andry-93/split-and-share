import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import {
    Dialog,
    Button,
    TextInput,
    List,
    HelperText,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Participant } from '../../../entities/types';

type Props = {
    visible: boolean;
    participants: Participant[];
    currency: string;

    initialDescription?: string;
    initialAmount?: number;
    initialPaidBy?: string;

    onDismiss: () => void;
    onSave: (data: {
        description: string;
        amount: number;
        paidBy: string;
    }) => void;
};

export const ExpenseDialog = ({
                                  visible,
                                  participants,
                                  currency,
                                  initialDescription = '',
                                  initialAmount,
                                  initialPaidBy,
                                  onDismiss,
                                  onSave,
                              }: Props) => {
    const { t } = useTranslation();

    const [description, setDescription] =
        useState('');
    const [amount, setAmount] =
        useState('');
    const [paidBy, setPaidBy] =
        useState<string | null>(null);

    const safeCurrency =
        currency?.trim() || '—';

    /* =======================
       INIT ON OPEN
       ======================= */

    useEffect(() => {
        if (!visible) return;

        setDescription(initialDescription);
        setAmount(
            initialAmount !== undefined
                ? initialAmount.toString()
                : ''
        );
        setPaidBy(initialPaidBy ?? null);
    }, [
        visible,
        initialDescription,
        initialAmount,
        initialPaidBy,
    ]);

    /* =======================
       SAVE
       ======================= */

    const handleSave = () => {
        if (!description || !amount || !paidBy) {
            return;
        }

        onSave({
            description: description.trim(),
            amount: Number(amount),
            paidBy,
        });
    };

    return (
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>
                {t('expense')}
            </Dialog.Title>

            <Dialog.Content>
                {/* ===== DESCRIPTION ===== */}
                <TextInput
                    label={t('description')}
                    value={description}
                    onChangeText={setDescription}
                    style={{ marginBottom: 12 }}
                />

                {/* ===== AMOUNT ===== */}
                <TextInput
                    label={t('amount')}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    dense
                    contentStyle={{
                        paddingVertical: 6,
                    }}
                    right={
                        <TextInput.Affix
                            text={safeCurrency}
                        />
                    }
                />

                <HelperText type="info">
                    {t('amount_hint', {
                        currency: safeCurrency,
                    })}
                </HelperText>

                {/* ===== PAID BY ===== */}
                <List.Subheader>
                    {t('paid_by')}
                </List.Subheader>

                <ScrollView
                    style={{ maxHeight: 220 }}
                >
                    {participants.map(p => (
                        <List.Item
                            key={p.id}
                            title={p.name}
                            onPress={() =>
                                setPaidBy(p.id)
                            }
                            left={() => (
                                <List.Icon
                                    icon={
                                        paidBy === p.id
                                            ? 'radiobox-marked'
                                            : 'radiobox-blank'
                                    }
                                />
                            )}
                        />
                    ))}
                </ScrollView>
            </Dialog.Content>

            <Dialog.Actions>
                <Button onPress={onDismiss}>
                    {t('cancel')}
                </Button>
                <Button
                    onPress={handleSave}
                    disabled={!paidBy}
                >
                    {t('save')}
                </Button>
            </Dialog.Actions>
        </Dialog>
    );
};

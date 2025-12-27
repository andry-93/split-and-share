import React from 'react';
import { View } from 'react-native';
import {
    Card,
    Text,
    useTheme,
} from 'react-native-paper';

import { Participant } from '@/entities/types';
import { ParticipantTotals } from '@/store/selectors/totals.selectors';

type Props = {
    totals: ParticipantTotals[];
    participants: Participant[];
    currency: string;
};

export const EventTotalsCard = ({
                                    totals,
                                    participants,
                                    currency,
                                }: Props) => {
    const { colors } = useTheme();

    if (totals.length === 0) {
        return null;
    }

    return (
        <Card style={{ marginTop: 16 }}>
            <Card.Title title="Totals" />

            <Card.Content>
                {totals.map(t => {
                    const participant = participants.find(
                        p => p.id === t.participantId
                    );

                    if (!participant) return null;

                    const color =
                        t.balance > 0
                            ? colors.primary
                            : t.balance < 0
                                ? colors.error
                                : colors.onSurfaceVariant;

                    return (
                        <View
                            key={t.participantId}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginVertical: 4,
                            }}
                        >
                            <Text>{participant.name}</Text>

                            <Text
                                style={{
                                    color,
                                    fontWeight: '600',
                                }}
                            >
                                {t.balance.toFixed(2)} {currency}
                            </Text>
                        </View>
                    );
                })}
            </Card.Content>
        </Card>
    );
};

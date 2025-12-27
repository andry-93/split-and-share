import { View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Participant } from '@/entities/types';

type Props = {
    participants: Participant[];
};

export const ParticipantsPreview = ({ participants }: Props) => {
    const { t } = useTranslation();

    if (participants.length === 0) {
        return <Text>{t('no_participants')}</Text>;
    }

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {participants.map(p => (
                <View
                    key={p.id}
                    style={{
                        alignItems: 'center',
                        marginRight: 16,
                        marginBottom: 12,
                    }}
                >
                    <Avatar.Text
                        size={40}
                        label={p.name[0].toUpperCase()}
                    />
                    <Text variant="labelSmall">{p.name}</Text>
                </View>
            ))}
        </View>
    );
};

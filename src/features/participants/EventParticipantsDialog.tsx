import React, { useEffect, useState } from 'react';
import {
    Portal,
    Dialog,
    Button,
    Checkbox,
    List,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Participant } from '../../entities/types';

type Props = {
    visible: boolean;
    participants: Participant[];
    selectedIds: string[];
    onDismiss: () => void;
    onSave: (ids: string[]) => void;
};

export const EventParticipantsDialog = ({
    visible,
    participants,
    selectedIds,
    onDismiss,
    onSave,
}: Props) => {
    const { t } = useTranslation();
    /** 🔹 ЛОКАЛЬНОЕ СОСТОЯНИЕ */
    const [localIds, setLocalIds] =
        useState<string[]>([]);

    /** 🔹 ИНИЦИАЛИЗАЦИЯ ПРИ ОТКРЫТИИ */
    useEffect(() => {
        if (visible) {
            setLocalIds(selectedIds);
        }
    }, [visible, selectedIds]);

    const toggle = (id: string) => {
        setLocalIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>
                    {t('participants')}
                </Dialog.Title>

                <Dialog.Content>
                    {participants.map(p => (
                        <List.Item
                            key={p.id}
                            title={p.name}
                            onPress={() => toggle(p.id)}
                            left={() => (
                                <Checkbox
                                    status={
                                        localIds.includes(p.id)
                                            ? 'checked'
                                            : 'unchecked'
                                    }
                                />
                            )}
                        />
                    ))}
                </Dialog.Content>

                <Dialog.Actions>
                    <Button onPress={onDismiss}>
                        {t('cancel')}
                    </Button>

                    <Button
                        onPress={() => onSave(localIds)}
                        disabled={localIds.length === 0}
                    >
                        {t('apply')}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

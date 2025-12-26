import React, { useEffect, useState } from 'react';
import { Portal, Button, Dialog, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface Props {
    visible: boolean;
    initialTitle?: string;
    onSave(title: string): void;
    onDismiss(): void;
}

export const EventDialog = ({
    visible,
    initialTitle = '',
    onSave,
    onDismiss,
}: Props) => {
    const [title, setTitle] = useState(initialTitle);
    const { t } = useTranslation();

    const isEdit = Boolean(initialTitle);

    useEffect(() => {
        if (visible) {
            setTitle(initialTitle);
        }
    }, [initialTitle, visible]);

    const handleSave = () => {
        const trimmed = title.trim();
        if (!trimmed) return;

        onSave(trimmed);
        setTitle('');
        onDismiss();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>
                    {isEdit
                        ? t('edit_event')
                        : t('new_event')}
                </Dialog.Title>

                <Dialog.Content>
                    <TextInput
                        label={t('title')}
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />
                </Dialog.Content>

                <Dialog.Actions>
                    <Button onPress={onDismiss}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onPress={handleSave}
                        disabled={!title.trim()}
                    >
                        {t('save')}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

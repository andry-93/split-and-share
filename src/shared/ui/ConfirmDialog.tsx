import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

type Props = {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export const ConfirmDialog = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
}: Props) => {
    const { t } = useTranslation();

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Title>{title}</Dialog.Title>

                <Dialog.Content>
                    <Text>{message}</Text>
                </Dialog.Content>

                <Dialog.Actions>
                    <Button onPress={onCancel}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onPress={onConfirm}
                        textColor="red"
                    >
                        {t('delete')}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

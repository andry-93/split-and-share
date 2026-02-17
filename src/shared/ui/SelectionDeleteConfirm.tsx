import React from 'react';
import { Text, useTheme } from 'react-native-paper';
import { AppConfirm } from '@/shared/ui/AppConfirm';

type SelectionDeleteConfirmProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onDismiss: () => void;
  onConfirm: () => void;
};

export function SelectionDeleteConfirm({
  visible,
  title,
  message,
  confirmText = 'Delete',
  onDismiss,
  onConfirm,
}: SelectionDeleteConfirmProps) {
  const theme = useTheme();

  return (
    <AppConfirm
      visible={visible}
      title={title}
      onDismiss={onDismiss}
      onConfirm={onConfirm}
      confirmText={confirmText}
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {message}
      </Text>
    </AppConfirm>
  );
}

import React from 'react';
import { Text, useTheme } from 'react-native-paper';
import { AppConfirm } from '@/shared/ui/AppConfirm';

type AppDeleteConfirmProps = {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  onConfirm: () => void;
};

export function AppDeleteConfirm({
  visible,
  title,
  message,
  onDismiss,
  onConfirm,
}: AppDeleteConfirmProps) {
  const theme = useTheme();

  return (
    <AppConfirm
      visible={visible}
      title={title}
      onDismiss={onDismiss}
      onConfirm={onConfirm}
      confirmText="Delete"
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {message}
      </Text>
    </AppConfirm>
  );
}

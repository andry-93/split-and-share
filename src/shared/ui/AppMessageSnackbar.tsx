import React from 'react';
import { Snackbar } from 'react-native-paper';

type AppMessageSnackbarProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
};

export function AppMessageSnackbar({ message, visible, onDismiss }: AppMessageSnackbarProps) {
  return (
    <Snackbar visible={visible} onDismiss={onDismiss}>
      {message}
    </Snackbar>
  );
}

import React, { memo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { AppPopup } from './AppPopup';

type AppConfirmProps = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onConfirm: () => void;
  onShow?: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
};

export const AppConfirm = memo(function AppConfirm({
  visible,
  title,
  onDismiss,
  onConfirm,
  onShow,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children,
}: AppConfirmProps) {
  const theme = useTheme();

  return (
    <AppPopup visible={visible} onDismiss={onDismiss} onShow={onShow}>
      <View style={styles.content}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
        {children}
      </View>
      <View style={[styles.actions, { borderTopColor: theme.colors.outlineVariant }]}>
        <Button mode="outlined" onPress={onDismiss} style={styles.actionButton}>
          {cancelText}
        </Button>
        <Button mode="contained" onPress={onConfirm} style={styles.actionButton}>
          {confirmText}
        </Button>
      </View>
    </AppPopup>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
});

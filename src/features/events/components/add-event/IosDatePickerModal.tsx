import React, { memo } from 'react';
import { Modal, Portal, Text, Button, useTheme } from 'react-native-paper';
import { addEventStyles as styles } from '@/features/events/components/add-event/styles';
import i18n from '@/shared/i18n';

type IosDatePickerModalProps = {
  visible: boolean;
  title?: string;
  doneLabel?: string;
  unavailableText?: string;
  onDismiss: () => void;
  onDone: () => void;
  children?: React.ReactNode;
};

export const IosDatePickerModal = memo(function IosDatePickerModal({
  visible,
  title = i18n.t('events.datePlaceholder'),
  doneLabel = i18n.t('common.save'),
  unavailableText = i18n.t('misc.rebuildToEnableDatePicker'),
  onDismiss,
  onDone,
  children,
}: IosDatePickerModalProps) {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.iosPickerModal,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
        ]}
      >
        <Text variant="titleMedium" style={styles.iosPickerTitle}>
          {title}
        </Text>
        {children ?? (
          <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
            {unavailableText}
          </Text>
        )}
        <Button mode="contained" onPress={onDone}>
          {doneLabel}
        </Button>
      </Modal>
    </Portal>
  );
});

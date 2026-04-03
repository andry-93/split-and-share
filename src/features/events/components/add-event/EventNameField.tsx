import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addEventStyles as styles } from '@/features/events/components/add-event/styles';
import i18n from '@/shared/i18n';

type EventNameFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const EventNameField = memo(function EventNameField({
  value,
  onChangeText,
}: EventNameFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        {i18n.t('events.eventName')}
      </Text>
      <OutlinedFieldContainer style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          autoFocus
          mode="flat"
          placeholder={i18n.t('events.eventNamePlaceholder')}
          style={[styles.inputField, styles.transparentInput]}
          contentStyle={styles.inputContent}
          underlineStyle={styles.hiddenUnderline}
        />
      </OutlinedFieldContainer>
    </>
  );
});

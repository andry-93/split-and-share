import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addEventStyles as styles } from '@/features/events/components/add-event/styles';

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
        Event name
      </Text>
      <OutlinedFieldContainer style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          autoFocus
          mode="flat"
          placeholder="e.g., Weekend Trip"
          style={[styles.inputField, styles.transparentInput]}
          contentStyle={styles.inputContent}
          underlineStyle={styles.hiddenUnderline}
        />
      </OutlinedFieldContainer>
    </>
  );
});

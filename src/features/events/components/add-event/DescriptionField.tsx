import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '../../../../shared/ui/OutlinedFieldContainer';
import { addEventStyles as styles } from './styles';

type DescriptionFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const DescriptionField = memo(function DescriptionField({
  value,
  onChangeText,
}: DescriptionFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        Description
      </Text>
      <OutlinedFieldContainer style={styles.multilineContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          multiline
          placeholder="Add details about the event (optional)"
          style={[styles.multilineField, styles.transparentInput]}
          contentStyle={styles.inputContent}
          underlineStyle={styles.hiddenUnderline}
        />
      </OutlinedFieldContainer>
    </>
  );
});

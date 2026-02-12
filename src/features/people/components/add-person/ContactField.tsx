import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '../../../../shared/ui/OutlinedFieldContainer';
import { addPersonStyles as styles } from './styles';

type ContactFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const ContactField = memo(function ContactField({ value, onChangeText }: ContactFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        Phone or email
      </Text>
      <OutlinedFieldContainer style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          placeholder="Phone or email"
          style={[styles.inputField, styles.transparentInput]}
          contentStyle={styles.inputContent}
          underlineStyle={styles.hiddenUnderline}
        />
      </OutlinedFieldContainer>
    </>
  );
});

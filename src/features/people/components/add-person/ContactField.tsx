import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addPersonStyles as styles } from '@/features/people/components/add-person/styles';

type ContactFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

export const ContactField = memo(function ContactField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
}: ContactFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        {label}
      </Text>
      <OutlinedFieldContainer style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          mode="flat"
          placeholder={placeholder}
          style={[styles.inputField, styles.transparentInput]}
          contentStyle={styles.inputContent}
          underlineStyle={styles.hiddenUnderline}
        />
      </OutlinedFieldContainer>
    </>
  );
});

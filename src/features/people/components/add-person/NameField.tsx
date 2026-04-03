import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addPersonStyles as styles } from '@/features/people/components/add-person/styles';
import i18n from '@/shared/i18n';

type NameFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const NameField = memo(function NameField({ value, onChangeText }: NameFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        {i18n.t('common.name')}
      </Text>
      <OutlinedFieldContainer style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          autoFocus
          mode="flat"
          placeholder={i18n.t('common.name')}
          style={[styles.inputField, styles.transparentInput]}
          contentStyle={styles.inputContent}
          underlineStyle={styles.hiddenUnderline}
        />
      </OutlinedFieldContainer>
    </>
  );
});

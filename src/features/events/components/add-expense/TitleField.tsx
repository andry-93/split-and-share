import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '../../../../shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from './styles';

type TitleFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const TitleField = memo(function TitleField({ value, onChangeText }: TitleFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Title
      </Text>
      <OutlinedFieldContainer style={styles.titleInputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          style={[styles.titleInlineInput, styles.transparentInput]}
          contentStyle={styles.titleInlineInputContent}
          underlineStyle={styles.hiddenUnderline}
          placeholder="e.g. Dinner, Taxi, Hotel"
        />
      </OutlinedFieldContainer>
    </>
  );
});

import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addPersonStyles as styles } from '@/features/people/components/add-person/styles';

type NoteFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const NoteField = memo(function NoteField({ value, onChangeText }: NoteFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        Note
      </Text>
      <OutlinedFieldContainer style={styles.multilineContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          multiline
          placeholder="Note"
          style={[styles.multilineField, styles.transparentInput]}
          contentStyle={styles.inputContent}
          underlineStyle={styles.hiddenUnderline}
        />
      </OutlinedFieldContainer>
    </>
  );
});

import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from '@/features/events/components/add-expense/styles';
import i18n from '@/shared/i18n';

type TitleFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const TitleField = memo(function TitleField({ value, onChangeText }: TitleFieldProps) {
  return (
    <>
      <Text variant="labelLarge" style={styles.sectionLabel}>
        {i18n.t('common.title')}
      </Text>
      <OutlinedFieldContainer style={styles.titleInputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          style={[styles.titleInlineInput, styles.transparentInput]}
          contentStyle={styles.titleInlineInputContent}
          underlineStyle={styles.hiddenUnderline}
          placeholder={i18n.t('events.expenseTitlePlaceholder')}
        />
      </OutlinedFieldContainer>
    </>
  );
});

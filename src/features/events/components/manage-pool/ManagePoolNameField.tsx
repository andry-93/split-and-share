import React, { memo } from 'react';
import { Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from '@/features/events/components/add-expense/styles';

type ManagePoolNameFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const ManagePoolNameField = memo(function ManagePoolNameField({
  value,
  onChangeText,
}: ManagePoolNameFieldProps) {
  const { t } = useTranslation();
  return (
    <>
      <Text variant="labelLarge" style={styles.sectionLabel}>
        {t('events.pools.poolName')}
      </Text>
      <OutlinedFieldContainer style={styles.titleInputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          style={[styles.titleInlineInput, styles.transparentInput]}
          contentStyle={styles.titleInlineInputContent}
          underlineStyle={styles.hiddenUnderline}
          placeholder={t('events.pools.poolNamePlaceholder')}
        />
      </OutlinedFieldContainer>
    </>
  );
});

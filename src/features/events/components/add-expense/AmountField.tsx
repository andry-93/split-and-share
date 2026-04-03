import React, { memo } from 'react';
import { TextInput } from 'react-native-paper';
import { Text } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from '@/features/events/components/add-expense/styles';
import { getAmountInputPlaceholder } from '@/shared/utils/numberFormat';
import i18n from '@/shared/i18n';

type AmountFieldProps = {
  currencyCode: string;
  value: string;
  onChangeText: (value: string) => void;
};

export const AmountField = memo(function AmountField({
  currencyCode,
  value,
  onChangeText,
}: AmountFieldProps) {
  const placeholder = getAmountInputPlaceholder();

  return (
    <>
      <Text variant="labelLarge" style={styles.sectionLabel}>
        {i18n.t('common.amount')}
      </Text>
      <OutlinedFieldContainer style={styles.amountInputContainer}>
        <Text variant="headlineSmall" style={styles.amountCurrency}>
          {currencyCode}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          mode="flat"
          style={[styles.amountInlineInput, styles.transparentInput]}
          contentStyle={styles.amountInlineInputContent}
          underlineStyle={styles.hiddenUnderline}
          placeholder={placeholder}
        />
      </OutlinedFieldContainer>
    </>
  );
});

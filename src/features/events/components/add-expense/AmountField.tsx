import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from '@/features/events/components/add-expense/styles';
import { getAmountInputPlaceholder } from '@/shared/utils/numberFormat';
import { formatDecimalAmount } from '@/shared/utils/numberFormat';
import i18n from '@/shared/i18n';
import { MathAccessoryBar } from '@/shared/ui/MathAccessoryBar';

type AmountFieldProps = {
  currencyCode: string;
  value: string;
  onChangeText: (value: string) => void;
  isExpression?: boolean;
  calculationResult?: number | null;
  onApplyResult?: (result: number) => void;
};

export const AmountField = memo(function AmountField({
  currencyCode,
  value,
  onChangeText,
  isExpression,
  calculationResult,
  onApplyResult,
}: AmountFieldProps) {
  const theme = useTheme();
  const placeholder = getAmountInputPlaceholder();

  const handleInsertChar = useCallback((char: string) => {
    onChangeText(value + char);
  }, [onChangeText, value]);

  const handleApply = useCallback(() => {
    if (calculationResult !== null && calculationResult !== undefined) {
      onApplyResult?.(calculationResult);
    }
  }, [calculationResult, onApplyResult]);

  const showPreview = isExpression && calculationResult !== null && calculationResult !== undefined;

  return (
    <>
      <Text variant="labelLarge" style={styles.sectionLabel}>
        {i18n.t('common.amount')}
      </Text>
      <OutlinedFieldContainer style={localStyles.fieldGroup}>
        <View style={localStyles.inputRow}>
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
        </View>
        {showPreview && (
          <Pressable onPress={handleApply} style={localStyles.previewRow}>
            <View style={localStyles.previewContent}>
              <Text
                variant="bodyMedium"
                style={[localStyles.previewEquals, { color: theme.colors.onSurfaceVariant }]}
              >
                =
              </Text>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.primary }}
              >
                {formatDecimalAmount(calculationResult ?? 0)}
              </Text>
            </View>
            <View
              style={[
                localStyles.applyChip,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onPrimaryContainer }}
              >
                {i18n.t('common.apply')}
              </Text>
            </View>
          </Pressable>
        )}
        <MathAccessoryBar onInsert={handleInsertChar} />
      </OutlinedFieldContainer>
    </>
  );
});

const localStyles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  inputRow: {
    minHeight: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewEquals: {
    fontSize: 16,
    fontWeight: '500',
  },
  applyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

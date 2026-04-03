import React, { memo } from 'react';
import { addExpenseStyles } from '@/features/events/components/add-expense/styles';
import { BottomPrimaryActionBar } from '@/shared/ui/BottomPrimaryActionBar';
import i18n from '@/shared/i18n';

type BottomActionBarProps = {
  onSave: () => void;
  disabled: boolean;
  bottomInset: number;
  label?: string;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

export const BottomActionBar = memo(function BottomActionBar({
  onSave,
  disabled,
  bottomInset,
  label = i18n.t('events.saveExpense'),
  secondaryLabel,
  onSecondaryPress,
}: BottomActionBarProps) {
  return (
    <BottomPrimaryActionBar
      bottomInset={bottomInset}
      disabled={disabled}
      onPress={onSave}
      label={label}
      secondaryLabel={secondaryLabel}
      onSecondaryPress={onSecondaryPress}
      containerStyle={addExpenseStyles.bottomBar}
    />
  );
});

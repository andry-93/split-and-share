import React, { memo } from 'react';
import { addPersonStyles } from '@/features/people/components/add-person/styles';
import { BottomPrimaryActionBar } from '@/shared/ui/BottomPrimaryActionBar';

type BottomActionBarProps = {
  bottomInset: number;
  disabled: boolean;
  label: string;
  onPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

export const BottomActionBar = memo(function BottomActionBar({
  bottomInset,
  disabled,
  label,
  onPress,
  secondaryLabel,
  onSecondaryPress,
}: BottomActionBarProps) {
  return (
    <BottomPrimaryActionBar
      bottomInset={bottomInset}
      disabled={disabled}
      onPress={onPress}
      label={label}
      secondaryLabel={secondaryLabel}
      onSecondaryPress={onSecondaryPress}
      containerStyle={addPersonStyles.bottomBar}
    />
  );
});

import React, { memo } from 'react';
import { addEventStyles } from '@/features/events/components/add-event/styles';
import { BottomPrimaryActionBar } from '@/shared/ui/BottomPrimaryActionBar';

type BottomActionBarProps = {
  bottomInset: number;
  disabled: boolean;
  onPress: () => void;
  label?: string;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

export const BottomActionBar = memo(function BottomActionBar({
  bottomInset,
  disabled,
  onPress,
  label = 'Create event',
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
      containerStyle={addEventStyles.bottomBar}
    />
  );
});

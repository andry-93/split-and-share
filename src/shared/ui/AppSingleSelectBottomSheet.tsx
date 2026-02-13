import React, { forwardRef, memo, useCallback } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetSingleSelectRow } from '@/shared/ui/BottomSheetSingleSelectRow';
import { AppBottomSheet } from '@/shared/ui/AppBottomSheet';

type Option = {
  value: string;
  label: string;
};

type AppSingleSelectBottomSheetProps = {
  title: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  snapPoints?: Array<string | number>;
};

type OptionRowProps = {
  value: string;
  label: string;
  selected: boolean;
  isLast: boolean;
  onSelect: (value: string) => void;
};

const OptionRow = memo(function OptionRow({
  value,
  label,
  selected,
  isLast,
  onSelect,
}: OptionRowProps) {
  const handlePress = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <BottomSheetSingleSelectRow
      label={label}
      selected={selected}
      onPress={handlePress}
      isLast={isLast}
    />
  );
});

export const AppSingleSelectBottomSheet = forwardRef<
  BottomSheetModal,
  AppSingleSelectBottomSheetProps
>(function AppSingleSelectBottomSheet(
  { title, options, selectedValue, onSelect, snapPoints },
  ref,
) {
  return (
    <AppBottomSheet ref={ref} title={title} snapPoints={snapPoints}>
      {options.map((option, index) => (
        <OptionRow
          key={option.value}
          value={option.value}
          label={option.label}
          selected={selectedValue === option.value}
          onSelect={onSelect}
          isLast={index === options.length - 1}
        />
      ))}
    </AppBottomSheet>
  );
});


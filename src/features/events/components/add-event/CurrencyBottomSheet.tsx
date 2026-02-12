import React, { memo, useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Text, useTheme } from 'react-native-paper';
import { BottomSheetSingleSelectRow } from '../../../../shared/ui/BottomSheetSingleSelectRow';
import { addEventStyles as styles } from './styles';

type CurrencyBottomSheetProps<T extends string> = {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  title?: string;
  options: readonly T[];
  selectedValue: T;
  getLabel: (value: T) => string;
  onSelect: (value: T) => void;
  snapPoints: (string | number)[];
};

function CurrencyBottomSheetBase<T extends string>({
  sheetRef,
  title = 'Currency',
  options,
  selectedValue,
  getLabel,
  onSelect,
  snapPoints,
}: CurrencyBottomSheetProps<T>) {
  const theme = useTheme();

  const renderOption = useCallback(
    (value: T, index: number) => (
      <BottomSheetSingleSelectRow
        key={value}
        label={getLabel(value)}
        selected={selectedValue === value}
        onPress={() => onSelect(value)}
        isLast={index === options.length - 1}
      />
    ),
    [getLabel, onSelect, options.length, selectedValue],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
      backgroundStyle={{
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.roundness * 3,
        borderTopRightRadius: theme.roundness * 3,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
    >
      <BottomSheetView style={[styles.sheetContent, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {options.map(renderOption)}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export const CurrencyBottomSheet = memo(CurrencyBottomSheetBase) as <T extends string>(
  props: CurrencyBottomSheetProps<T>,
) => React.JSX.Element;

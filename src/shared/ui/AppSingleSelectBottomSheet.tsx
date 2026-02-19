import React, { forwardRef, memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index }: { item: Option; index: number }) => (
      <OptionRow
        value={item.value}
        label={item.label}
        selected={selectedValue === item.value}
        onSelect={onSelect}
        isLast={index === options.length - 1}
      />
    ),
    [onSelect, options.length, selectedValue],
  );

  return (
    <AppBottomSheet ref={ref} title={title} snapPoints={snapPoints} useContainer={false}>
      <BottomSheetFlatList
        data={options}
        keyExtractor={(item: Option) => item.value}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: Math.max(insets.bottom, 24) }} />}
      />
    </AppBottomSheet>
  );
});
AppSingleSelectBottomSheet.displayName = 'AppSingleSelectBottomSheet';

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
  },
});

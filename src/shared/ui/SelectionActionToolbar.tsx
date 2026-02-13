import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Checkbox, Text, useTheme } from 'react-native-paper';

type SelectionActionToolbarProps = {
  title: string;
  totalSelectableCount: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export const SelectionActionToolbar = memo(function SelectionActionToolbar({
  title,
  totalSelectableCount,
  selectedCount,
  onToggleSelectAll,
  onDelete,
  onClose,
}: SelectionActionToolbarProps) {
  const theme = useTheme();

  const allSelected = totalSelectableCount > 0 && selectedCount === totalSelectableCount;
  const checkboxStatus = allSelected
    ? 'checked'
    : selectedCount > 0
      ? 'indeterminate'
      : 'unchecked';

  return (
    <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Action icon="close" onPress={onClose} />
      <View style={styles.selectAllWrap}>
        <Checkbox status={checkboxStatus} onPress={onToggleSelectAll} />
        <Text variant="titleSmall">{title}</Text>
      </View>
      <Appbar.Action icon="delete-outline" onPress={onDelete} disabled={selectedCount === 0} />
    </Appbar.Header>
  );
});

const styles = StyleSheet.create({
  selectAllWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

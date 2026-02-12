import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, Text, useTheme } from 'react-native-paper';

type BottomSheetSingleSelectRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
};

export const BottomSheetSingleSelectRow = memo(function BottomSheetSingleSelectRow({
  label,
  selected,
  onPress,
  isLast = false,
}: BottomSheetSingleSelectRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          borderBottomColor: theme.colors.outlineVariant,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
      <View style={styles.radio}>
        <RadioButton
          value={label}
          status={selected ? 'checked' : 'unchecked'}
          onPress={onPress}
          color={theme.colors.primary}
          uncheckedColor={theme.colors.outline}
        />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
  },
  radio: {
    marginRight: -4,
  },
});

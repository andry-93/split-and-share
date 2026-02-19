import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, Text, useTheme } from 'react-native-paper';

type BottomSheetSingleSelectRowProps = {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
};

export const BottomSheetSingleSelectRow = memo(function BottomSheetSingleSelectRow({
  label,
  description,
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
      <View style={styles.texts}>
        <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          {label}
        </Text>
        {description ? (
          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {description}
          </Text>
        ) : null}
      </View>
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
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  texts: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    flexShrink: 1,
  },
  description: {
    marginTop: 2,
  },
  radio: {
    marginRight: -4,
  },
});

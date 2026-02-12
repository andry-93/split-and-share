import React, { memo, useCallback } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type ToggleOption<T extends string> = {
  value: T;
  label: string;
};

type CustomToggleGroupProps<T extends string> = {
  value: T;
  options: ReadonlyArray<ToggleOption<T>>;
  onChange: (value: T) => void;
  sizeMode?: 'equal' | 'content';
  variant?: 'segmented' | 'chips';
  style?: StyleProp<ViewStyle>;
};

function CustomToggleGroupBase<T extends string>({
  value,
  options,
  onChange,
  sizeMode = 'equal',
  variant = 'segmented',
  style,
}: CustomToggleGroupProps<T>) {
  const theme = useTheme();

  const renderOption = useCallback(
    (option: ToggleOption<T>) => {
      const selected = option.value === value;

      return (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[
            styles.item,
            variant === 'chips' ? styles.itemChip : null,
            sizeMode === 'equal' ? styles.itemEqual : styles.itemContent,
            variant === 'segmented'
              ? selected
                ? { backgroundColor: theme.colors.elevation.level3 }
                : null
              : {
                  backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surface,
                  borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
                },
          ]}
        >
          <Text
            variant="labelLarge"
            numberOfLines={sizeMode === 'equal' ? 1 : undefined}
            ellipsizeMode={sizeMode === 'equal' ? 'tail' : undefined}
            style={[
              styles.label,
              variant === 'segmented'
                ? { color: selected ? theme.colors.onSurface : theme.colors.onSurfaceVariant }
                : {
                    color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                  },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      );
    },
    [
      onChange,
      sizeMode,
      variant,
      theme.colors.elevation.level3,
      theme.colors.onPrimaryContainer,
      theme.colors.onSurface,
      theme.colors.onSurfaceVariant,
      theme.colors.outlineVariant,
      theme.colors.primary,
      theme.colors.primaryContainer,
      theme.colors.surface,
      value,
    ],
  );

  return (
    <View
      style={[
        styles.container,
        variant === 'segmented'
          ? {
              backgroundColor: theme.colors.elevation.level2,
              borderColor: theme.colors.outlineVariant,
            }
          : styles.containerChips,
        sizeMode === 'content' ? styles.contentContainer : null,
        style,
      ]}
    >
      {options.map(renderOption)}
    </View>
  );
}

export const CustomToggleGroup = memo(
  CustomToggleGroupBase,
) as <T extends string>(props: CustomToggleGroupProps<T>) => React.JSX.Element;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  contentContainer: {
    alignSelf: 'center',
  },
  containerChips: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    gap: 8,
  },
  item: {
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemChip: {
    minHeight: 32,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
  itemEqual: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  itemContent: {
    width: 'auto',
    paddingHorizontal: 16,
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0,
  },
});

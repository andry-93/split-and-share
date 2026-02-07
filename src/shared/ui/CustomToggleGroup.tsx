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
  style?: StyleProp<ViewStyle>;
};

function CustomToggleGroupBase<T extends string>({
  value,
  options,
  onChange,
  sizeMode = 'equal',
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
            sizeMode === 'equal' ? styles.itemEqual : styles.itemContent,
            selected ? { backgroundColor: theme.colors.elevation.level3 } : null,
          ]}
        >
          <Text
            variant="labelLarge"
            numberOfLines={sizeMode === 'equal' ? 1 : undefined}
            ellipsizeMode={sizeMode === 'equal' ? 'tail' : undefined}
            style={[
              styles.label,
              { color: selected ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
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
      theme.colors.elevation.level3,
      theme.colors.onSurface,
      theme.colors.onSurfaceVariant,
      value,
    ],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.elevation.level2,
          borderColor: theme.colors.outlineVariant,
        },
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
    padding: 5,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  contentContainer: {
    alignSelf: 'center',
  },
  item: {
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

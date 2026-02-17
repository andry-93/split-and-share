import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type OutlinedFieldContainerProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  isError?: boolean;
}>;

export function OutlinedFieldContainer({ children, style, isError = false }: OutlinedFieldContainerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isError ? theme.colors.error : theme.colors.outlineVariant,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
  },
});

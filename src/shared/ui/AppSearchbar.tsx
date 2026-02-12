import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Searchbar, SearchbarProps, useTheme } from 'react-native-paper';

type AppSearchbarProps = SearchbarProps & {
  style?: StyleProp<ViewStyle>;
};

export function AppSearchbar({ style, inputStyle, ...props }: AppSearchbarProps) {
  const theme = useTheme();

  return (
    <Searchbar
      {...props}
      style={[
        styles.search,
        {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.outlineVariant,
        },
        style,
      ]}
      inputStyle={[styles.searchInput, inputStyle]}
    />
  );
}

const styles = StyleSheet.create({
  search: {
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchInput: {
    marginVertical: 0,
    minHeight: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});

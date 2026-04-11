import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Searchbar, SearchbarProps, useTheme } from 'react-native-paper';
import { Shadows, Typography } from './theme/styles';

type AppSearchbarProps = SearchbarProps & {
  style?: StyleProp<ViewStyle>;
};

/**
 * Premium Searchbar with soft shadows and better typography.
 */
export function AppSearchbar({ style, inputStyle, ...props }: AppSearchbarProps) {
  const theme = useTheme();

  return (
    <Searchbar
      {...props}
      placeholderTextColor={theme.colors.onSurfaceVariant}
      mode="bar"
      style={[
        styles.search,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          borderWidth: StyleSheet.hairlineWidth,
        },
        Shadows.soft,
        style,
      ]}
      inputStyle={[
        styles.searchInput, 
        { 
          color: theme.colors.onSurface,
          letterSpacing: Typography.letterSpacing.tight,
        }, 
        inputStyle
      ]}
      iconColor={theme.colors.primary}
    />
  );
}

const styles = StyleSheet.create({
  search: {
    height: 48,
    borderRadius: 14, // Softer rounding
    elevation: 0, // Reset default elevation to use my custom shadow
  },
  searchInput: {
    marginVertical: 0,
    minHeight: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    fontSize: 15,
  },
});

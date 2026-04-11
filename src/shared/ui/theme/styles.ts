import { Platform, StyleSheet, ViewStyle } from 'react-native';

/**
 * Premium Spacing System
 * Based on 4pt/8pt grid
 */
export const Spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

/**
 * Cross-platform Shadow System
 */
export const Shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  }) as ViewStyle,
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }) as ViewStyle,
  strong: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: {
      elevation: 10,
    },
  }) as ViewStyle,
};

/**
 * Premium Typography Enhancements
 */
export const Typography = {
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const CommonStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

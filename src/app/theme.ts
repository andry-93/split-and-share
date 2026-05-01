import { MD3Theme } from 'react-native-paper';

declare module 'react-native-paper' {
  export interface MD3Colors {
    successContainer: string;
    onSuccessContainer: string;
  }
}

export type AppTheme = Omit<MD3Theme, 'colors'> & {
  colors: MD3Theme['colors'] & {
    successContainer: string;
    onSuccessContainer: string;
  };
};

export const lightColorOverrides = {
  primary: '#1D4ED8', // Richer, premium blue
  onPrimary: '#F4FAFC',
  primaryContainer: '#DBEAFE', // Soft blue container
  onPrimaryContainer: '#1E3A8A', // Deep blue text on container
  secondary: '#475569', // Premium slate gray
  onSecondary: '#F4FAFC',
  secondaryContainer: '#CCFBF1', // Very light slate
  onSecondaryContainer: '#115E59',
  tertiary: '#0EA5E9', // Sky blue for accents
  onTertiary: '#F4FAFC',
  tertiaryContainer: '#E0F2FE',
  onTertiaryContainer: '#082F49',
  error: 'rgba(0, 0, 0, 0.1)',
  onError: '#F4FAFC',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#991B1B',
  background: '#ecf7fa', // The beautiful requested background
  onBackground: '#0F172A', // Deep luxury slate text
  surface: '#E4F3F8', // Noticeably tinted surface
  onSurface: '#0F172A', // Deep text on cards
  surfaceVariant: '#D8ECF3', // Even deeper subtle variant
  onSurfaceVariant: '#475569',
  outline: '#CBD5E1',
  outlineVariant: 'rgba(0, 0, 0, 0.1)',
  shadow: '#0F172A', // slightly colored shadow for better blends
  scrim: '#000000',
  inverseSurface: '#1E293B',
  inverseOnSurface: '#F8FAFC',
  inversePrimary: '#60A5FA',
  elevation: {
    level0: 'transparent',
    level1: '#E4F3F8',
    level2: '#E4F3F8',
    level3: '#E4F3F8',
    level4: '#E4F3F8',
    level5: '#E4F3F8',
  },
  surfaceDisabled: 'rgba(15, 23, 42, 0.08)',
  onSurfaceDisabled: 'rgba(15, 23, 42, 0.38)',
  backdrop: 'rgba(15, 23, 42, 0.4)',
  successContainer: '#DCFCE7',
  onSuccessContainer: '#15803D',
} as const;

export const darkColorOverrides = {
  primary: '#2563FF',
  onPrimary: '#F4FAFC',
  primaryContainer: '#183567',
  onPrimaryContainer: '#D9E6FF',
  secondary: '#8CA0BC',
  onSecondary: '#0C1B37',
  secondaryContainer: '#134E4A',
  onSecondaryContainer: '#99F6E4',
  tertiary: '#90A3C0',
  onTertiary: '#0C1B37',
  tertiaryContainer: '#2A3E5F',
  onTertiaryContainer: '#D9E6FF',
  error: 'rgba(255, 255, 255, 0.12)',
  onError: '#F4FAFC',
  errorContainer: '#5A1419',
  onErrorContainer: '#FEE2E2',
  background: '#081633',
  onBackground: '#E8EEF9',
  surface: '#1C2C47',
  onSurface: '#E8EEF9',
  surfaceVariant: '#324764',
  onSurfaceVariant: '#97A8C3',
  outline: '#48607D',
  outlineVariant: '#3C5371',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#1A2A45',
  inverseOnSurface: '#E8EEF9',
  inversePrimary: '#93B4FF',
  elevation: {
    level0: 'transparent',
    level1: '#102242',
    level2: '#2E4260',
    level3: '#4A5F7B',
    level4: '#304665',
    level5: '#385173',
  },
  surfaceDisabled: 'rgba(232, 238, 249, 0.12)',
  onSurfaceDisabled: 'rgba(232, 238, 249, 0.38)',
  backdrop: 'rgba(8, 22, 51, 0.6)',
  successContainer: '#064E3B',
  onSuccessContainer: '#34D399',
} as const;

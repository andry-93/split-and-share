import { useMemo } from 'react';
import { Appearance, NativeModules, Platform, useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
} from '@react-navigation/native';
import { useSettingsState } from '@/state/settings/settingsContext';
import { lightColorOverrides, darkColorOverrides } from '@/app/theme';

export function useAppAppearance() {
  const settings = useSettingsState();
  
  const androidUiModeScheme = useMemo<'light' | 'dark' | null>(() => {
    if (Platform.OS !== 'android') {
      return null;
    }

    const rawUiMode = NativeModules.PlatformConstants?.uiMode;
    if (typeof rawUiMode !== 'string') {
      return null;
    }

    const normalized = rawUiMode.toLowerCase();
    if (normalized.includes('night')) {
      return 'dark';
    }
    if (normalized.includes('normal')) {
      return 'light';
    }

    return null;
  }, []);

  const rnScheme = useColorScheme();
  const appearanceScheme = Appearance.getColorScheme();
  
  const systemScheme = useMemo<'light' | 'dark'>(() => {
    const candidates = [rnScheme, appearanceScheme, androidUiModeScheme];
    if (candidates.includes('dark')) {
      return 'dark';
    }
    return 'light';
  }, [androidUiModeScheme, appearanceScheme, rnScheme]);

  const resolvedScheme = useMemo<'light' | 'dark'>(() => {
    if (settings.theme === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return settings.theme;
  }, [settings.theme, systemScheme]);

  const paperTheme = useMemo(() => {
    const baseTheme = resolvedScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
    const colorOverrides = resolvedScheme === 'dark' ? darkColorOverrides : lightColorOverrides;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...colorOverrides,
      },
    };
  }, [resolvedScheme]);

  const navTheme = useMemo(() => {
    const baseNavTheme = resolvedScheme === 'dark' ? NavDarkTheme : NavLightTheme;

    return {
      ...baseNavTheme,
      colors: {
        ...baseNavTheme.colors,
        primary: paperTheme.colors.primary,
        background: paperTheme.colors.background,
        card: paperTheme.colors.surface,
        text: paperTheme.colors.onSurface,
        border: paperTheme.colors.outlineVariant,
        notification: paperTheme.colors.error,
      },
    };
  }, [paperTheme, resolvedScheme]);

  return {
    resolvedScheme,
    paperTheme,
    navTheme,
    backgroundColor: paperTheme.colors.background,
  };
}

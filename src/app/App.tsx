import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, BackHandler, NativeModules, Platform, StatusBar, useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, Snackbar } from 'react-native-paper';
import {
  NavigationContainer,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AppProviders } from '@/state/AppProviders';
import { MigrationGate } from '@/state/storage/MigrationGate';
import { PersistenceSync } from '@/state/storage/PersistenceSync';
import { getLanguageLocale } from '@/state/settings/languageCatalog';
import { useSettingsState } from '@/state/settings/settingsContext';
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary';
import { setGlobalCurrencyLocalePreference } from '@/shared/utils/currency';
import { setGlobalNumberFormatPreference } from '@/shared/utils/numberFormat';
import { RootTabParamList } from '@/navigation/types';

const lightColorOverrides = {
  primary: '#2563FF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D9E6FF',
  onPrimaryContainer: '#0E214A',
  secondary: '#4B5A70',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FFFFFF',
  onSecondaryContainer: '#1A2233',
  tertiary: '#4B5A70',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E8ECF2',
  onTertiaryContainer: '#1A2233',
  error: '#D92D20',
  onError: '#FFFFFF',
  errorContainer: '#FEE4E2',
  onErrorContainer: '#B42318',
  background: '#F3F5F8',
  onBackground: '#111827',
  surface: '#F8FAFC',
  onSurface: '#111827',
  surfaceVariant: '#E6EAF0',
  onSurfaceVariant: '#5B667A',
  outline: '#C7CED8',
  outlineVariant: '#D7DDE5',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#1F2937',
  inverseOnSurface: '#F9FAFB',
  inversePrimary: '#A8C1FF',
  elevation: {
    level0: 'transparent',
    level1: '#EEF2F7',
    level2: '#E7ECF3',
    level3: '#F8FAFC',
    level4: '#E4E9F1',
    level5: '#DFE5EE',
  },
  surfaceDisabled: 'rgba(17, 24, 39, 0.08)',
  onSurfaceDisabled: 'rgba(17, 24, 39, 0.38)',
  backdrop: 'rgba(17, 24, 39, 0.4)',
} as const;

const darkColorOverrides = {
  primary: '#2563FF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#183567',
  onPrimaryContainer: '#D9E6FF',
  secondary: '#8CA0BC',
  onSecondary: '#0C1B37',
  secondaryContainer: '#4A5F7B',
  onSecondaryContainer: '#F3F7FF',
  tertiary: '#90A3C0',
  onTertiary: '#0C1B37',
  tertiaryContainer: '#2A3E5F',
  onTertiaryContainer: '#D9E6FF',
  error: '#EF4444',
  onError: '#FFFFFF',
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
  inverseSurface: '#E8EEF9',
  inverseOnSurface: '#1A2A45',
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
} as const;

function AppShell() {
  const settings = useSettingsState();
  const navigationRef = useMemo(() => createNavigationContainerRef<RootTabParamList>(), []);
  const [exitHintVisible, setExitHintVisible] = useState(false);
  const lastBackPressAtRef = useRef(0);
  const hideHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setGlobalNumberFormatPreference(settings.numberFormat);
  }, [settings.numberFormat]);

  useEffect(() => {
    setGlobalCurrencyLocalePreference(getLanguageLocale(settings.language));
  }, [settings.language]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!navigationRef.isReady()) {
        return false;
      }

      if (navigationRef.canGoBack()) {
        return false;
      }

      const now = Date.now();
      const isSecondPress = now - lastBackPressAtRef.current <= 2000;
      if (isSecondPress) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressAtRef.current = now;
      setExitHintVisible(true);
      if (hideHintTimeoutRef.current) {
        clearTimeout(hideHintTimeoutRef.current);
      }
      hideHintTimeoutRef.current = setTimeout(() => {
        setExitHintVisible(false);
      }, 2000);
      return true;
    });

    return () => {
      subscription.remove();
      if (hideHintTimeoutRef.current) {
        clearTimeout(hideHintTimeoutRef.current);
      }
    };
  }, [navigationRef]);

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
    if (candidates.includes('light')) {
      return 'light';
    }
    return 'light';
  }, [androidUiModeScheme, appearanceScheme, rnScheme]);
  const resolvedScheme = useMemo<'light' | 'dark'>(() => {
    if (settings.theme === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return settings.theme;
  }, [settings.theme, systemScheme]);
  const paperTheme = useMemo(
    () => {
      const baseTheme = resolvedScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
      const colorOverrides = resolvedScheme === 'dark' ? darkColorOverrides : lightColorOverrides;

      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          ...colorOverrides,
        },
      };
    },
    [resolvedScheme],
  );
  const navTheme = useMemo(
    () => {
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
    },
    [paperTheme.colors.background, paperTheme.colors.error, paperTheme.colors.onSurface, paperTheme.colors.outlineVariant, paperTheme.colors.primary, paperTheme.colors.surface, resolvedScheme],
  );

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={resolvedScheme === "dark" ? "light-content" : "dark-content"}
        translucent={false}
      />
      <BottomSheetModalProvider>
        <NavigationContainer ref={navigationRef} theme={navTheme}>
          <AppNavigator />
        </NavigationContainer>
        <Snackbar
          visible={exitHintVisible}
          onDismiss={() => setExitHintVisible(false)}
        >
          Press back again to exit
        </Snackbar>
      </BottomSheetModalProvider>
    </PaperProvider>
  );
}

export function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MigrationGate>
          <AppProviders>
            <PersistenceSync>
              <AppErrorBoundary>
                <AppShell />
              </AppErrorBoundary>
            </PersistenceSync>
          </AppProviders>
        </MigrationGate>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

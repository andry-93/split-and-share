import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, BackHandler, NativeModules, Platform, StatusBar, useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, Snackbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
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
import { getIsStorageInitialized, getStorageInitializationError, initializeStorage } from '@/state/storage/mmkv';
import { getLanguageLocale } from '@/state/settings/languageCatalog';
import { useSettingsState } from '@/state/settings/settingsContext';
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary';
import { StorageInitErrorScreen } from '@/shared/ui/StorageInitErrorScreen';
import { setGlobalCurrencyLocalePreference } from '@/shared/utils/currency';
import { setGlobalNumberFormatPreference } from '@/shared/utils/numberFormat';
import { RootTabParamList } from '@/navigation/types';
import i18n, { resolveI18nLanguage } from '@/shared/i18n';
import '@/shared/i18n';
import { SecurityGate } from '@/shared/ui/security/SecurityGate';
import { rehydrateStore } from '@/state/store';

import { lightColorOverrides, darkColorOverrides } from '@/app/theme';
function AppShell() {
  const settings = useSettingsState();
  const { t } = useTranslation();
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
    const nextLanguage = resolveI18nLanguage(settings.language);
    if (i18n.language !== nextLanguage) {
      void i18n.changeLanguage(nextLanguage);
    }
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
          <SecurityGate>
            <AppNavigator />
          </SecurityGate>
        </NavigationContainer>
        <Snackbar
          visible={exitHintVisible}
          onDismiss={() => setExitHintVisible(false)}
        >
          {t('app.backExitHint')}
        </Snackbar>
      </BottomSheetModalProvider>
    </PaperProvider>
  );
}

import * as SplashScreen from 'expo-splash-screen';
import { AnimatedSplashScreen } from '@/app/AnimatedSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export function App() {
  const [initError, setInitError] = useState<unknown>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSplashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initializeStorage();
        rehydrateStore();
        setIsReady(true);
      } catch (error) {
        setInitError(error);
      }
    }
    init();
  }, []);

  const storageInitializationError = initError || getStorageInitializationError();

  if (storageInitializationError) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider theme={MD3LightTheme}>
            <StorageInitErrorScreen />
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {isReady && (
          <MigrationGate>
            <AppProviders>
              <AppErrorBoundary>
                <AppShell />
              </AppErrorBoundary>
            </AppProviders>
          </MigrationGate>
        )}
        
        {isReady && !isSplashAnimationComplete && (
          <AnimatedSplashScreen 
            onAnimationFinish={() => setSplashAnimationComplete(true)} 
          />
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

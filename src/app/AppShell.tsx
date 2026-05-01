import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, StatusBar } from 'react-native';
import { PaperProvider, Snackbar, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { AppNavigator } from '@/navigation/AppNavigator';
import { SecurityGate } from '@/shared/ui/security/SecurityGate';
import { useSettingsState } from '@/state/settings/settingsContext';
import { useAppAppearance } from '@/shared/hooks/useAppAppearance';
import { useSyncSettings } from '@/shared/hooks/useSyncSettings';
import { OnboardingScreen } from '@/features/onboarding/screens/OnboardingScreen';
import { RootTabParamList } from '@/navigation/types';

export function AppShell() {
  // Appearance & Theme
  const { resolvedScheme, paperTheme, navTheme } = useAppAppearance();
  
  // Settings sync (localization, currency, formatting)
  useSyncSettings();

  const settings = useSettingsState();
  const { t } = useTranslation();
  const navigationRef = useMemo(() => createNavigationContainerRef<RootTabParamList>(), []);
  
  // Android back-press exit logic
  const [exitHintVisible, setExitHintVisible] = useState(false);
  const lastBackPressAtRef = useRef(0);
  const hideHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!settings.onboardingCompleted) {
        return false;
      }

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
  }, [navigationRef, settings.onboardingCompleted]);

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={resolvedScheme === "dark" ? "light-content" : "dark-content"}
        translucent={false}
      />
      <BottomSheetModalProvider>
        {!settings.onboardingCompleted ? (
          <OnboardingScreen />
        ) : (
          <NavigationContainer ref={navigationRef} theme={navTheme}>
            <SecurityGate>
              <AppNavigator />
            </SecurityGate>
          </NavigationContainer>
        )}
        <Snackbar
          visible={exitHintVisible}
          onDismiss={() => setExitHintVisible(false)}
          theme={paperTheme}
          style={{ backgroundColor: paperTheme.colors.surface }}
        >
          <Text style={{ color: paperTheme.colors.onSurface }}>{t('app.backExitHint')}</Text>
        </Snackbar>
      </BottomSheetModalProvider>
    </PaperProvider>
  );
}

import React, { useMemo } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppNavigator } from '../navigation/AppNavigator';
import { AppProviders } from '../state/AppProviders';
import { MigrationGate } from '../state/storage/MigrationGate';
import { PersistenceSync } from '../state/storage/PersistenceSync';
import { useSettingsState } from '../state/settings/settingsContext';

function AppShell() {
  const settings = useSettingsState();
  const systemScheme = useColorScheme() ?? Appearance.getColorScheme() ?? 'light';
  const resolvedScheme = useMemo<'light' | 'dark'>(() => {
    if (settings.theme === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return settings.theme;
  }, [settings.theme, systemScheme]);
  const paperTheme = resolvedScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const navTheme = resolvedScheme === 'dark' ? NavDarkTheme : NavLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <BottomSheetModalProvider>
        <NavigationContainer theme={navTheme}>
          <AppNavigator />
        </NavigationContainer>
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
              <AppShell />
            </PersistenceSync>
          </AppProviders>
        </MigrationGate>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

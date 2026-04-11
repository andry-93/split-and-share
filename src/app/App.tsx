import React, { useEffect, useState } from 'react';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

import { AppProviders } from '@/state/AppProviders';
import { MigrationGate } from '@/state/storage/MigrationGate';
import { getStorageInitializationError, initializeStorage } from '@/state/storage/mmkv';
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary';
import { StorageInitErrorScreen } from '@/shared/ui/StorageInitErrorScreen';
import { rehydrateStore } from '@/state/store';
import { AppShell } from '@/app/AppShell';
import { AnimatedSplashScreen } from '@/app/AnimatedSplashScreen';

// Keep the native splash screen visible while we fetch resources
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
                {!isSplashAnimationComplete && (
                  <AnimatedSplashScreen 
                    onAnimationFinish={() => setSplashAnimationComplete(true)} 
                  />
                )}
              </AppErrorBoundary>
            </AppProviders>
          </MigrationGate>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSettingsState } from '@/state/settings/settingsContext';
import { LockScreen } from './LockScreen';

interface SecurityGateProps {
  children: React.ReactNode;
}

export function SecurityGate({ children }: SecurityGateProps) {
  const settings = useSettingsState();
  const [isLocked, setIsLocked] = useState(settings.isSecurityEnabled);
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

  // Update lock state if security is disabled
  useEffect(() => {
    if (!settings.isSecurityEnabled) {
      setIsLocked(false);
    }
  }, [settings.isSecurityEnabled]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (!settings.isSecurityEnabled) return;

    if (
      appState.current.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      // App went to background
      backgroundTime.current = Date.now();
    }

    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App came to foreground
      if (backgroundTime.current) {
        const elapsed = Date.now() - backgroundTime.current;
        if (elapsed > settings.autoLockGracePeriod) {
          setIsLocked(true);
        }
        backgroundTime.current = null;
      } else {
        // If no background time recorded (app killed/restarted), lock if security enabled
        setIsLocked(true);
      }
    }

    appState.current = nextAppState;
  }, [settings.isSecurityEnabled, settings.autoLockGracePeriod]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  if (isLocked && settings.isSecurityEnabled) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return <>{children}</>;
}

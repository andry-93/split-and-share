import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { Text, Button, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { verifyMasterPassword } from '@/state/storage/securityStore';
import { useSettingsState } from '@/state/settings/settingsContext';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const settings = useSettingsState();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricsAvailable(hasHardware && isEnrolled);
    
    if (hasHardware && isEnrolled && settings.isBiometricsEnabled) {
      handleBiometricAuth();
    }
  };

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('settings.lockScreenInstructions'),
        fallbackLabel: t('settings.enterMasterPassword'),
      });

      if (result.success) {
        onUnlock();
      }
    } catch (e) {
      console.error('[Security] Biometric auth failed:', e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePasswordUnlock = async () => {
    if (!password) return;
    
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const isValid = await verifyMasterPassword(password);
      if (isValid) {
        onUnlock();
      } else {
        setError(t('settings.invalidMasterPassword'));
        setPassword('');
      }
    } catch (e) {
      console.error('[Security] Password verification failed:', e);
      setError(t('app.unhandledErrorTitle'));
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <IconButton
              icon="lock-outline"
              size={64}
              iconColor={theme.colors.primary}
              style={styles.lockIcon}
            />
            <Text variant="headlineMedium" style={styles.title}>
              {t('settings.lockScreenTitle')}
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('settings.lockScreenInstructions')}
            </Text>
          </View>

          <View style={styles.form}>
            <OutlinedFieldContainer isError={!!error}>
              <RNTextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                secureTextEntry
                placeholder={t('settings.enterMasterPassword')}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                style={[styles.input, { color: theme.colors.onSurface }]}
                onSubmitEditing={handlePasswordUnlock}
                autoFocus
              />
            </OutlinedFieldContainer>

            {error && (
              <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handlePasswordUnlock}
              loading={isAuthenticating}
              disabled={!password || isAuthenticating}
              style={styles.unlockButton}
              contentStyle={styles.buttonContent}
            >
              {t('settings.unlock')}
            </Button>

            {isBiometricsAvailable && settings.isBiometricsEnabled && (
              <Button
                mode="text"
                onPress={handleBiometricAuth}
                icon="fingerprint"
                style={styles.biometricButton}
              >
                {t('settings.biometrics')}
              </Button>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  lockIcon: {
    margin: 0,
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  form: {
    width: '100%',
    gap: 12,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    marginLeft: 4,
    marginTop: -8,
    marginBottom: 4,
  },
  unlockButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    height: 52,
  },
  biometricButton: {
    marginTop: 16,
  },
});

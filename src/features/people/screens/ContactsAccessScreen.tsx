import React, { useCallback, useEffect } from 'react';
import { AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { PeopleStackParamList } from '@/navigation/types';
import { AppHeader } from '@/shared/ui/AppHeader';
import { useMessageState } from '@/shared/hooks/useMessageState';
import { AppMessageSnackbar } from '@/shared/ui/AppMessageSnackbar';
import { getContactsPermissionStatus, requestContactsPermission } from '@/features/people/services/contactsPermission';
import { trackProductEvent } from '@/shared/analytics/productAnalytics';

type ContactsAccessScreenProps = NativeStackScreenProps<PeopleStackParamList, 'ImportContactsAccess'>;

export function ContactsAccessScreen({ navigation }: ContactsAccessScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { message: errorMessage, setMessage: setErrorMessage, clearMessage: clearErrorMessage, visible: isErrorVisible } =
    useMessageState();
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const navigateToPicker = useCallback(() => {
    navigation.replace('ImportContactsPicker');
  }, [navigation]);
  const checkPermissionAndNavigate = useCallback(async () => {
    const status = await getContactsPermissionStatus();
    if (status === 'granted') {
      navigateToPicker();
      return true;
    }
    return false;
  }, [navigateToPicker]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        if (!active) {
          return;
        }
        await checkPermissionAndNavigate();
      })();

      return () => {
        active = false;
      };
    }, [checkPermissionAndNavigate]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        void checkPermissionAndNavigate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermissionAndNavigate]);

  const handleContinue = useCallback(async () => {
    trackProductEvent('contacts_permission_requested');
    const status = await requestContactsPermission();
    if (status === 'granted') {
      trackProductEvent('contacts_permission_result', { status: 'granted' });
      navigateToPicker();
      return;
    }

    trackProductEvent('contacts_permission_result', { status });

    if (status === 'unavailable') {
      setErrorMessage(t('people.import.permissionUnavailable'));
    }
  }, [navigateToPicker, setErrorMessage, t]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title={t('people.import.accessTitle')} onBackPress={handleBack} />

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Icon source="account-group" size={36} color={theme.colors.primary} />
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          {t('people.import.accessTitle')}
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.supporting, { color: theme.colors.onSurfaceVariant }]}
        >
          {t('people.import.accessDescription')}
        </Text>
      </View>

      <View
        style={[
          styles.actions,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <Button mode="contained" onPress={handleContinue} style={styles.primaryButton}>
          {t('people.import.continue')}
        </Button>
        <Button mode="outlined" onPress={handleBack} style={styles.secondaryButton}>
          {t('people.import.notNow')}
        </Button>
      </View>

      <AppMessageSnackbar
        message={errorMessage}
        visible={isErrorVisible}
        onDismiss={clearErrorMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  supporting: {
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
});

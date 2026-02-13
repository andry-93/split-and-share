import React, { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { Button, Icon, Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { PeopleStackParamList } from '@/navigation/types';
import { AppHeader } from '@/shared/ui/AppHeader';
import { getContactsPermissionStatus, requestContactsPermission } from '@/features/people/services/contactsPermission';

type ContactsAccessScreenProps = NativeStackScreenProps<PeopleStackParamList, 'ImportContactsAccess'>;

export function ContactsAccessScreen({ navigation }: ContactsAccessScreenProps) {
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = useState('');
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
    const status = await requestContactsPermission();
    if (status === 'granted') {
      navigateToPicker();
      return;
    }

    if (status === 'unavailable') {
      setErrorMessage('Contacts permission is unavailable on this device.');
    }
  }, [navigateToPicker]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Contacts access" onBackPress={handleBack} />

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Icon source="account-group" size={36} color={theme.colors.primary} />
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          Access Your Contacts
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.supporting, { color: theme.colors.onSurfaceVariant }]}
        >
          To import people from your contacts, we&apos;ll need permission to access your contact list.
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
          Continue
        </Button>
        <Button mode="outlined" onPress={handleBack} style={styles.secondaryButton}>
          Not now
        </Button>
      </View>

      <Snackbar visible={errorMessage.length > 0} onDismiss={() => setErrorMessage('')}>
        {errorMessage}
      </Snackbar>
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

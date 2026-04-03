import React from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export function StorageInitErrorScreen() {
  const { t } = useTranslation();
  const canCloseApp = Platform.OS === 'android';

  const handleCloseApp = () => {
    if (canCloseApp) {
      BackHandler.exitApp();
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        {t('app.storageInitErrorTitle')}
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {t('app.storageInitErrorDescription')}
      </Text>
      {canCloseApp ? (
        <Button mode="contained" onPress={handleCloseApp}>
          {t('app.storageInitErrorCloseApp')}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});

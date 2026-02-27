import React from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export function StorageInitErrorScreen() {
  const canCloseApp = Platform.OS === 'android';

  const handleCloseApp = () => {
    if (canCloseApp) {
      BackHandler.exitApp();
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Secure storage error
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        The app could not initialize encrypted local storage. Restart the app. If it still fails,
        reinstall the app.
      </Text>
      {canCloseApp ? (
        <Button mode="contained" onPress={handleCloseApp}>
          Close app
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

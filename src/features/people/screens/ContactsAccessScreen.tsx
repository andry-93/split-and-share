import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '../../../navigation/types';

type ContactsAccessScreenProps = NativeStackScreenProps<PeopleStackParamList, 'ImportContactsAccess'>;

export function ContactsAccessScreen({ navigation }: ContactsAccessScreenProps) {
  const theme = useTheme();
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleContinue = useCallback(() => navigation.navigate('ImportContactsPicker'), [navigation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Contacts access" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="titleLarge">Allow access to contacts</Text>
        <Text variant="bodyMedium" style={styles.supporting}>
          This lets you quickly add people you already know. We never store or share your contacts.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button mode="contained" onPress={handleContinue}>
          Continue
        </Button>
        <Button mode="text" onPress={handleBack}>
          Not now
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  supporting: {
    marginTop: 12,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
});

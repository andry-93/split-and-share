import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Appbar, Button, Snackbar, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '../../../navigation/types';
import { usePeopleActions } from '../../../state/people/peopleContext';

type AddPersonScreenProps = NativeStackScreenProps<PeopleStackParamList, 'AddPerson'>;

export function AddPersonScreen({ navigation }: AddPersonScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addPerson } = usePeopleActions();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isDisabled = useMemo(() => name.trim().length === 0, [name]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(() => {
    const trimmedContact = contact.trim();
    if (trimmedContact) {
      const isEmail = trimmedContact.includes('@');
      const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[0-9\\s-]{5,}$/;

      if (isEmail && !emailPattern.test(trimmedContact)) {
        setErrorMessage('Please enter a valid email.');
        return;
      }

      if (!isEmail && !phonePattern.test(trimmedContact)) {
        setErrorMessage('Please enter a valid phone number.');
        return;
      }
    }

    try {
      addPerson({ name, contact, note });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add person.';
      setErrorMessage(message);
    }
  }, [addPerson, contact, name, navigation, note]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Add Person" />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.form}>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            autoFocus
            style={styles.input}
          />
          <TextInput
            label="Phone or email"
            value={contact}
            onChangeText={setContact}
            style={styles.input}
          />
          <TextInput
            label="Note"
            value={note}
            onChangeText={setNote}
            multiline
            style={styles.input}
          />
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}> 
          <Button mode="contained" onPress={handleSave} disabled={isDisabled}>
            Add person
          </Button>
        </View>
      </KeyboardAvoidingView>

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
  flex: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});

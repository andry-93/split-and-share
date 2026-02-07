import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Appbar, Button, Snackbar, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsActions } from '../../../state/events/eventsContext';

type AddEventScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddEvent'>;

export function AddEventScreen({ navigation }: AddEventScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { createEvent } = useEventsActions();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCreate = useCallback(() => {
    try {
      createEvent({ name, description });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create event.';
      setErrorMessage(message);
    }
  }, [createEvent, description, name, navigation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Add Event" />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.form}>
          <TextInput
            label="Event name"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.input}
          />
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button
            mode="contained"
            onPress={handleCreate}
            disabled={name.trim().length === 0}
          >
            Create event
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

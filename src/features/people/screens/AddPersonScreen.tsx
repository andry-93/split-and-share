import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '../../../navigation/types';
import { usePeopleActions } from '../../../state/people/peopleContext';
import { OutlinedFieldContainer } from '../../../shared/ui/OutlinedFieldContainer';

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
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.outlineVariant }}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Add Person" />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.form, { paddingBottom: 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Name
          </Text>
          <OutlinedFieldContainer style={styles.inputContainer}>
            <TextInput
              value={name}
              onChangeText={setName}
              autoFocus
              mode="flat"
              placeholder="Name"
              style={[styles.inputField, { backgroundColor: 'transparent' }]}
              contentStyle={styles.inputContent}
              underlineStyle={styles.hiddenUnderline}
            />
          </OutlinedFieldContainer>

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Phone or email
          </Text>
          <OutlinedFieldContainer style={styles.inputContainer}>
            <TextInput
              value={contact}
              onChangeText={setContact}
              mode="flat"
              placeholder="Phone or email"
              style={[styles.inputField, { backgroundColor: 'transparent' }]}
              contentStyle={styles.inputContent}
              underlineStyle={styles.hiddenUnderline}
            />
          </OutlinedFieldContainer>

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Note
          </Text>
          <OutlinedFieldContainer style={styles.multilineContainer}>
            <TextInput
              value={note}
              onChangeText={setNote}
              mode="flat"
              multiline
              placeholder="Note"
              style={[styles.multilineField, { backgroundColor: 'transparent' }]}
              contentStyle={styles.inputContent}
              underlineStyle={styles.hiddenUnderline}
            />
          </OutlinedFieldContainer>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              borderTopColor: theme.colors.outlineVariant,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 56,
    marginBottom: 20,
    justifyContent: 'center',
  },
  inputField: {
    height: 52,
  },
  inputContent: {
    paddingHorizontal: 14,
  },
  multilineContainer: {
    minHeight: 96,
    marginBottom: 20,
  },
  multilineField: {
    minHeight: 92,
  },
  hiddenUnderline: {
    display: 'none',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

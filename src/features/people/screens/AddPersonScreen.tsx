import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '../../../navigation/types';
import { usePeopleActions, usePeopleState } from '../../../state/people/peopleContext';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { validatePersonEmail, validatePersonPhone } from '../../../shared/utils/validation';
import { addPersonStyles as featureStyles } from '../components/add-person/styles';
import { NameField } from '../components/add-person/NameField';
import { ContactField } from '../components/add-person/ContactField';
import { NoteField } from '../components/add-person/NoteField';
import { BottomActionBar } from '../components/add-person/BottomActionBar';

type AddPersonScreenProps = NativeStackScreenProps<PeopleStackParamList, 'AddPerson'>;

export function AddPersonScreen({ navigation, route }: AddPersonScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { people } = usePeopleState();
  const { addPerson, updatePerson } = usePeopleActions();
  const editingPerson = useMemo(
    () => (route.params?.personId ? people.find((person) => person.id === route.params?.personId) : undefined),
    [people, route.params?.personId],
  );
  const isEditMode = Boolean(editingPerson);
  const [name, setName] = useState(editingPerson?.name ?? '');
  const [phone, setPhone] = useState(editingPerson?.phone ?? '');
  const [email, setEmail] = useState(editingPerson?.email ?? '');
  const [note, setNote] = useState(editingPerson?.note ?? '');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setName(editingPerson?.name ?? '');
    setPhone(editingPerson?.phone ?? '');
    setEmail(editingPerson?.email ?? '');
    setNote(editingPerson?.note ?? '');
  }, [editingPerson?.email, editingPerson?.id, editingPerson?.name, editingPerson?.note, editingPerson?.phone]);

  const isDisabled = useMemo(() => name.trim().length === 0, [name]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(() => {
    const phoneValidation = validatePersonPhone(phone);
    if (!phoneValidation.isValid) {
      setErrorMessage(phoneValidation.message);
      return;
    }

    const emailValidation = validatePersonEmail(email);
    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.message);
      return;
    }

    try {
      if (editingPerson) {
        updatePerson({ id: editingPerson.id, name, phone, email, note });
      } else {
        addPerson({ name, phone, email, note });
      }
      navigation.goBack();
    } catch (error) {
      const fallbackMessage = editingPerson ? 'Unable to update person.' : 'Unable to add person.';
      const message = error instanceof Error ? error.message : fallbackMessage;
      setErrorMessage(message);
    }
  }, [addPerson, editingPerson, email, name, navigation, note, phone, updatePerson]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title={isEditMode ? 'Edit Person' : 'Add Person'} onBackPress={handleBack} />

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[featureStyles.form, { paddingBottom: 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <NameField value={name} onChangeText={setName} />

          <ContactField
            label="Phone"
            placeholder="Phone"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <ContactField
            label="Email"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <NoteField value={note} onChangeText={setNote} />
        </ScrollView>

        <BottomActionBar
          bottomInset={insets.bottom}
          disabled={isDisabled}
          onPress={handleSave}
          label={isEditMode ? 'Save changes' : 'Add person'}
        />
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
});

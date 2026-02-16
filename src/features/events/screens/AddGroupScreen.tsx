import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '@/shared/ui/AppHeader';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { BottomActionBar } from '@/features/events/components/add-event/BottomActionBar';
import { addEventStyles as styles } from '@/features/events/components/add-event/styles';
import { useAddGroupForm } from '@/features/events/hooks/useAddGroupForm';
import { EventsStackParamList } from '@/navigation/types';

type AddGroupScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddGroup'>;

export function AddGroupScreen({ navigation, route }: AddGroupScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    editingGroup,
    name,
    setName,
    description,
    setDescription,
    errorMessage,
    setErrorMessage,
    handleSave,
  } = useAddGroupForm({
    groupId: route.params?.groupId,
    onSaved: navigation.goBack,
  });

  return (
    <SafeAreaView
      style={[localStyles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <AppHeader title={editingGroup ? 'Edit group' : 'Add group'} onBackPress={navigation.goBack} />

      <KeyboardAvoidingView
        style={localStyles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={localStyles.flex}
          contentContainerStyle={[styles.form, { paddingBottom: 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Group name
          </Text>
          <OutlinedFieldContainer style={styles.inputContainer}>
            <TextInput
              value={name}
              onChangeText={setName}
              autoFocus
              mode="flat"
              placeholder="e.g., Trips"
              style={[styles.inputField, styles.transparentInput]}
              contentStyle={styles.inputContent}
              underlineStyle={styles.hiddenUnderline}
            />
          </OutlinedFieldContainer>

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Description
          </Text>
          <OutlinedFieldContainer style={styles.multilineContainer}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              mode="flat"
              multiline
              placeholder="Optional"
              style={[styles.multilineField, styles.transparentInput]}
              contentStyle={styles.inputContent}
              underlineStyle={styles.hiddenUnderline}
            />
          </OutlinedFieldContainer>
        </ScrollView>

        <BottomActionBar
          bottomInset={insets.bottom}
          onPress={handleSave}
          label={editingGroup ? 'Save changes' : 'Create group'}
          disabled={name.trim().length === 0}
        />
      </KeyboardAvoidingView>

      <Snackbar visible={errorMessage.length > 0} onDismiss={() => setErrorMessage('')}>
        {errorMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});

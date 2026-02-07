import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Appbar, Button, Checkbox, List, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsActions } from '../../../state/events/eventsContext';

const participants = ['Alice', 'Bob', 'Charlie'];

type AddExpenseScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddExpense'>;

export function AddExpenseScreen({ navigation, route }: AddExpenseScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addExpense } = useEventsActions();
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [paidBy, setPaidBy] = useState(participants[0]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(participants);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedSet = useMemo(() => new Set(selectedParticipants), [selectedParticipants]);
  const isSaveDisabled = useMemo(() => {
    return amount.trim().length === 0 || title.trim().length === 0;
  }, [amount, title]);

  const toggleParticipant = useCallback((name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  }, []);

  const snapPoints = useMemo(() => ['40%'], []);

  const openPicker = useCallback(() => {
    Keyboard.dismiss();
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const handleSelectPaidBy = useCallback((name: string) => {
    setPaidBy(name);
    sheetRef.current?.dismiss();
  }, []);

  const renderParticipantRow = useCallback(
    (name: string) => (
      <ParticipantRow
        key={name}
        name={name}
        selected={selectedSet.has(name)}
        onToggle={toggleParticipant}
      />
    ),
    [selectedSet, toggleParticipant],
  );

  const renderPaidByOption = useCallback(
    (name: string) => (
      <PaidByOptionRow key={name} name={name} selected={paidBy === name} onSelect={handleSelectPaidBy} />
    ),
    [handleSelectPaidBy, paidBy],
  );

  const handleSave = useCallback(() => {
    const parsedAmount = Number(amount.replace(',', '.'));

    try {
      addExpense({
        eventId: route.params.eventId,
        expense: {
          title,
          amount: parsedAmount,
          paidBy,
        },
      });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save expense.';
      setErrorMessage(message);
    }
  }, [addExpense, amount, navigation, paidBy, route.params.eventId, title]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Expense" />
      </Appbar.Header>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.form}>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            placeholder="0"
          />

          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Dinner"
            style={styles.input}
          />

          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Paid by
            </Text>
            <Button mode="outlined" onPress={openPicker}>
              {paidBy}
            </Button>
          </View>

          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Split between
            </Text>
            {participants.map(renderParticipantRow)}
          </View>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button mode="contained" onPress={handleSave} disabled={isSaveDisabled}>
            Save expense
          </Button>
        </View>
      </KeyboardAvoidingView>

      <Snackbar visible={errorMessage.length > 0} onDismiss={() => setErrorMessage('')}>
        {errorMessage}
      </Snackbar>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        backgroundStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.roundness * 3,
          borderTopRightRadius: theme.roundness * 3,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      >
        <BottomSheetView style={[styles.sheetContent, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>
            Paid by
          </Text>
          {participants.map(renderPaidByOption)}
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

type ParticipantRowProps = {
  name: string;
  selected: boolean;
  onToggle: (name: string) => void;
};

const ParticipantRow = memo(function ParticipantRow({ name, selected, onToggle }: ParticipantRowProps) {
  const handleToggle = useCallback(() => {
    onToggle(name);
  }, [name, onToggle]);

  return (
    <Checkbox.Item
      label={name}
      status={selected ? 'checked' : 'unchecked'}
      onPress={handleToggle}
    />
  );
});

type PaidByOptionRowProps = {
  name: string;
  selected: boolean;
  onSelect: (name: string) => void;
};

const PaidByOptionRow = memo(function PaidByOptionRow({ name, selected, onSelect }: PaidByOptionRowProps) {
  const theme = useTheme();
  const handleSelect = useCallback(() => {
    onSelect(name);
  }, [name, onSelect]);

  return (
    <List.Item
      title={name}
      onPress={handleSelect}
      titleStyle={{ color: theme.colors.onSurface }}
      left={(props) => (selected ? <List.Icon {...props} icon="check" /> : null)}
    />
  );
});

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
  amountInput: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    marginBottom: 8,
  },
});

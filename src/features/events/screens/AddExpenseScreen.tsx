import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsActions, useEventsState } from '../../../state/events/eventsContext';
import { useSettingsState } from '../../../state/settings/settingsContext';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { useAddExpenseForm } from '../hooks/useAddExpenseForm';
import { AppSingleSelectBottomSheet } from '../../../shared/ui/AppSingleSelectBottomSheet';
import { useDismissBottomSheetsOnBlur } from '../../../shared/hooks/useDismissBottomSheetsOnBlur';
import { addExpenseStyles as featureStyles } from '../components/add-expense/styles';
import { AmountField } from '../components/add-expense/AmountField';
import { TitleField } from '../components/add-expense/TitleField';
import { BottomActionBar } from '../components/add-expense/BottomActionBar';
import { CategoryId, CategorySelector } from '../components/add-expense/CategorySelector';
import { PaidByField } from '../components/add-expense/PaidByField';
import { SplitBetweenField } from '../components/add-expense/SplitBetweenField';

type AddExpenseScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddExpense'>;

export function AddExpenseScreen({ navigation, route }: AddExpenseScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events } = useEventsState();
  const { addExpense } = useEventsActions();
  const event = useMemo(
    () => events.find((item) => item.id === route.params.eventId),
    [events, route.params.eventId],
  );
  const [category, setCategory] = useState<CategoryId>('food');
  const sheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([sheetRef]);
  const [errorMessage, setErrorMessage] = useState('');
  const {
    amount,
    title,
    paidById,
    selectedSet,
    participantOptions,
    participantNames,
    selectedCurrency,
    paidBy,
    parsedAmount,
    isSaveDisabled,
    setAmount,
    setTitle,
    setPaidById,
    toggleParticipant,
  } = useAddExpenseForm({
    participants: event?.participants ?? [],
    currency: event?.currency,
    fallbackCurrency: settings.currency,
  });

  const snapPoints = useMemo(() => ['40%'], []);

  const openPaidByPicker = useCallback(() => {
    Keyboard.dismiss();
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const handleSelectPaidBy = useCallback((id: string) => {
    setPaidById(id);
    sheetRef.current?.dismiss();
  }, []);

  const paidByOptions = useMemo(
    () =>
      participantOptions.map((participant) => ({
        value: participant.id,
        label: participant.name,
      })),
    [participantOptions],
  );

  const handleSave = useCallback(() => {
      if (!paidBy.trim()) {
        setErrorMessage('Select who paid this expense.');
        return;
      }

    try {
      addExpense({
        eventId: route.params.eventId,
        expense: {
          title,
          amount: parsedAmount,
          paidBy,
          paidById,
        },
      });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save expense.';
      setErrorMessage(message);
    }
  }, [addExpense, navigation, paidBy, paidById, parsedAmount, route.params.eventId, title]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Add Expense" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            featureStyles.form,
            featureStyles.formContentGrow,
            { paddingBottom: 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AmountField currencyCode={selectedCurrency} value={amount} onChangeText={setAmount} />

          <TitleField value={title} onChangeText={setTitle} />

          <CategorySelector value={category} onChange={setCategory} />

          <View style={featureStyles.section}>
            <Text variant="labelLarge" style={featureStyles.sectionLabel}>
              Paid by
            </Text>
            <PaidByField paidBy={paidBy} onPress={openPaidByPicker} />
          </View>

          <View style={featureStyles.section}>
            <Text variant="labelLarge" style={featureStyles.sectionLabel}>
              Split between
            </Text>
            <SplitBetweenField
              participants={participantNames}
              selectedSet={selectedSet}
              onToggle={toggleParticipant}
            />
          </View>
        </ScrollView>

        <BottomActionBar onSave={handleSave} disabled={isSaveDisabled} bottomInset={insets.bottom} />
      </KeyboardAvoidingView>

      <Snackbar visible={errorMessage.length > 0} onDismiss={() => setErrorMessage('')}>
        {errorMessage}
      </Snackbar>

      <AppSingleSelectBottomSheet
        ref={sheetRef}
        title="Paid by"
        options={paidByOptions}
        selectedValue={paidById}
        onSelect={handleSelectPaidBy}
        snapPoints={snapPoints}
      />
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

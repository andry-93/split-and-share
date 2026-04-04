import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { EventsStackParamList } from '@/navigation/types';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { useSettingsState } from '@/state/settings/settingsContext';
import { AppHeader } from '@/shared/ui/AppHeader';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useMessageState } from '@/shared/hooks/useMessageState';
import { useAddExpenseForm } from '@/features/events/hooks/useAddExpenseForm';
import { AppSingleSelectBottomSheet } from '@/shared/ui/AppSingleSelectBottomSheet';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { addExpenseStyles as featureStyles } from '@/features/events/components/add-expense/styles';
import { AmountField } from '@/features/events/components/add-expense/AmountField';
import { TitleField } from '@/features/events/components/add-expense/TitleField';
import { BottomActionBar } from '@/features/events/components/add-expense/BottomActionBar';
import { CategoryId, CategorySelector } from '@/features/events/components/add-expense/CategorySelector';
import { PaidByField } from '@/features/events/components/add-expense/PaidByField';
import { SplitBetweenField } from '@/features/events/components/add-expense/SplitBetweenField';
import { AppDeleteConfirm } from '@/shared/ui/AppDeleteConfirm';
import { AppMessageSnackbar } from '@/shared/ui/AppMessageSnackbar';
import { formatMoneyInputValue } from '@/shared/utils/numberFormat';

type AddExpenseScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddExpense'>;

export function AddExpenseScreen({ navigation, route }: AddExpenseScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events } = useEventsState();
  const { addExpense, updateExpense, removeExpenses } = useEventsActions();
  const eventId = route.params?.eventId;
  const event = useMemo(
    () => (eventId ? events.find((item) => item.id === eventId) : undefined),
    [eventId, events],
  );
  const editingExpense = useMemo(
    () => event?.expenses.find((expense) => expense.id === route.params?.expenseId),
    [event?.expenses, route.params?.expenseId],
  );
  const isEditMode = Boolean(editingExpense);
  const [category, setCategory] = useState<CategoryId>('food');
  const sheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([sheetRef]);
  const { message: errorMessage, setMessage: setErrorMessage, clearMessage: clearErrorMessage, visible: isErrorVisible } =
    useMessageState();
  const { isVisible: isDeleteConfirmVisible, open: openDeleteConfirm, close: closeDeleteConfirm } =
    useConfirmState();
  const {
    amount,
    title,
    paidById,
    selectedSet,
    participantOptions,
    selectedParticipantIds,
    selectedCurrencyCode,
    paidBy,
    isExpression,
    calculationResult,
    parsedAmountMinor,
    isSaveDisabled,
    setAmount,
    setTitle,
    setPaidById,
    toggleParticipant,
  } = useAddExpenseForm({
    participants: event?.participants ?? [],
    currency: event?.currency,
    fallbackCurrency: settings.currency,
    initialAmount: editingExpense ? formatMoneyInputValue(editingExpense.amountMinor / 100) : '',
    initialTitle: editingExpense?.title ?? '',
    initialPaidById: editingExpense?.paidById,
    initialSplitBetweenIds: editingExpense?.splitBetweenIds,
  });

  const snapPoints = useMemo(() => ['40%'], []);

  const openPaidByPicker = useCallback(() => {
    Keyboard.dismiss();
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectPaidBy = useCallback((id: string) => {
    setPaidById(id);
    sheetRef.current?.dismiss();
  }, [setPaidById]);

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
      setErrorMessage(t('events.selectPayer'));
      return;
    }

    try {
      if (editingExpense) {
        if (!eventId) {
          throw new Error(t('events.notFoundTitle'));
        }
        updateExpense({
          eventId,
          expenseId: editingExpense.id,
          patch: {
            title,
            amountMinor: parsedAmountMinor,
            paidBy,
            paidById,
            splitBetweenIds: selectedParticipantIds,
          },
        });
      } else {
        if (!eventId) {
          throw new Error(t('events.notFoundTitle'));
        }
        addExpense({
          eventId,
          expense: {
            title,
            amountMinor: parsedAmountMinor,
            paidBy,
            paidById,
            splitBetweenIds: selectedParticipantIds,
          },
        });
      }
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : editingExpense ? t('events.updateExpenseAgain') : t('events.saveExpenseAgain');
      setErrorMessage(message);
    }
  }, [
    addExpense,
    editingExpense,
    eventId,
    navigation,
    paidBy,
    paidById,
    parsedAmountMinor,
    selectedParticipantIds,
    setErrorMessage,
    t,
    title,
    updateExpense,
  ]);

  const handleDelete = useCallback(() => {
    if (!editingExpense || !eventId) {
      return;
    }
    removeExpenses({ eventId, expenseIds: [editingExpense.id] });
    closeDeleteConfirm();
    navigation.goBack();
  }, [closeDeleteConfirm, editingExpense, eventId, navigation, removeExpenses]);

  const handleApplyResult = useCallback((result: number) => {
    setAmount(formatMoneyInputValue(result));
  }, [setAmount]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title={isEditMode ? t('events.editExpense') : t('events.addExpense')} onBackPress={handleBack} />

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
          <AmountField
            currencyCode={selectedCurrencyCode}
            value={amount}
            onChangeText={setAmount}
            isExpression={isExpression}
            calculationResult={calculationResult}
            onApplyResult={handleApplyResult}
          />

          <TitleField value={title} onChangeText={setTitle} />

          <CategorySelector value={category} onChange={setCategory} />

          <View style={featureStyles.section}>
            <Text variant="labelLarge" style={featureStyles.sectionLabel}>
              {t('events.report.paidBy')}
            </Text>
            <PaidByField paidBy={paidBy} onPress={openPaidByPicker} />
          </View>

          <View style={featureStyles.section}>
            <Text variant="labelLarge" style={featureStyles.sectionLabel}>
              {t('events.splitBetween')}
            </Text>
            <SplitBetweenField
              participants={participantOptions}
              selectedSet={selectedSet}
              onToggle={toggleParticipant}
            />
          </View>
        </ScrollView>

        <BottomActionBar
          onSave={handleSave}
          disabled={isSaveDisabled}
          bottomInset={insets.bottom}
          label={isEditMode ? t('common.saveChanges') : t('events.saveExpense')}
          secondaryLabel={isEditMode ? t('common.delete') : undefined}
          onSecondaryPress={isEditMode ? openDeleteConfirm : undefined}
        />
      </KeyboardAvoidingView>

      <AppMessageSnackbar
        message={errorMessage}
        visible={isErrorVisible}
        onDismiss={clearErrorMessage}
      />

      <AppDeleteConfirm
        visible={isDeleteConfirmVisible}
        title={t('events.deleteExpense.title')}
        message={t('events.deleteExpense.message')}
        onDismiss={closeDeleteConfirm}
        onConfirm={handleDelete}
      />

      <AppSingleSelectBottomSheet
        ref={sheetRef}
        title={t('events.report.paidBy')}
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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { EventsStackParamList } from '@/navigation/types';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { useSettingsState } from '@/state/settings/settingsContext';
import { normalizeCurrencyCode } from '@/shared/utils/currency';
import { AppHeader } from '@/shared/ui/AppHeader';
import { EventNameField } from '@/features/events/components/add-event/EventNameField';
import { DescriptionField } from '@/features/events/components/add-event/DescriptionField';
import { CurrencyField } from '@/features/events/components/add-event/CurrencyField';
import { DateField } from '@/features/events/components/add-event/DateField';
import { BottomActionBar } from '@/features/events/components/add-event/BottomActionBar';
import { addEventStyles as featureStyles } from '@/features/events/components/add-event/styles';
import { CurrencyBottomSheet } from '@/features/events/components/add-event/CurrencyBottomSheet';
import { IosDatePickerModal } from '@/features/events/components/add-event/IosDatePickerModal';
import { useEventDatePicker } from '@/features/events/hooks/useEventDatePicker';
import { EVENT_CURRENCY_OPTIONS, useEventCurrency } from '@/features/events/hooks/useEventCurrency';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { AppConfirm } from '@/shared/ui/AppConfirm';

type AddEventScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddEvent'>;

function formatDate(value: Date) {
  const dd = `${value.getDate()}`.padStart(2, '0');
  const mm = `${value.getMonth() + 1}`.padStart(2, '0');
  const yyyy = value.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function AddEventScreen({ navigation, route }: AddEventScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events } = useEventsState();
  const { createEvent, updateEvent, removeEvents } = useEventsActions();
  const routeEventId = route.params?.eventId;
  const targetEvent = useMemo(
    () => events.find((event) => event.id === routeEventId),
    [events, routeEventId],
  );
  const isEditMode = Boolean(targetEvent);
  const [name, setName] = useState(targetEvent?.name ?? '');
  const [description, setDescription] = useState(targetEvent?.description ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const currencySheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([currencySheetRef]);
  const {
    selectedDate,
    draftDate,
    datePickerVisible,
    hasNativeDatePicker,
    DateTimePicker,
    resolvedThemeVariant,
    setSelectedDate,
    handleOpenDatePicker,
    handleCloseDatePicker,
    handleConfirmDatePicker,
    handleDraftDateChange,
  } = useEventDatePicker({
    themeMode: settings.theme,
    onError: setErrorMessage,
  });
  const { currencyOptions, currencyLabels, eventCurrency, setEventCurrency } = useEventCurrency(
    targetEvent?.currency ?? settings.currency,
  );

  useEffect(() => {
    if (!targetEvent) {
      return;
    }
    setName(targetEvent.name);
    setDescription(targetEvent.description ?? '');
  }, [targetEvent]);

  useEffect(() => {
    if (!targetEvent) {
      return;
    }
    if (
      targetEvent.currency &&
      EVENT_CURRENCY_OPTIONS.includes(targetEvent.currency as (typeof EVENT_CURRENCY_OPTIONS)[number])
    ) {
      setEventCurrency(targetEvent.currency as (typeof EVENT_CURRENCY_OPTIONS)[number]);
    }
    if (targetEvent.date) {
      const parsed = new Date(targetEvent.date);
      if (!Number.isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
      }
    }
  }, [setEventCurrency, setSelectedDate, targetEvent]);
  const snapPoints = useMemo(() => ['40%'], []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openCurrencyPicker = useCallback(() => {
    currencySheetRef.current?.present();
  }, []);

  const handleSelectCurrency = useCallback(
    (value: (typeof currencyOptions)[number]) => {
      setEventCurrency(value);
      currencySheetRef.current?.dismiss();
    },
    [],
  );

  const handleSave = useCallback(() => {
    try {
      if (targetEvent) {
        updateEvent({
          eventId: targetEvent.id,
          name,
          description,
          currency: eventCurrency,
          date: selectedDate ? selectedDate.toISOString() : null,
        });
      } else {
        createEvent({
          name,
          description,
          currency: eventCurrency,
          date: selectedDate ? selectedDate.toISOString() : null,
        });
      }
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Unable to ${targetEvent ? 'update' : 'create'} event.`;
      setErrorMessage(message);
    }
  }, [createEvent, description, eventCurrency, name, navigation, selectedDate, targetEvent, updateEvent]);

  const handleDelete = useCallback(() => {
    if (!targetEvent) {
      return;
    }
    removeEvents({ eventIds: [targetEvent.id] });
    setIsDeleteConfirmVisible(false);
    navigation.goBack();
  }, [navigation, removeEvents, targetEvent]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title={isEditMode ? 'Edit Event' : 'Add Event'} onBackPress={handleBack} />

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
          <EventNameField value={name} onChangeText={setName} />

          <DescriptionField value={description} onChangeText={setDescription} />

          <CurrencyField
            value={normalizeCurrencyCode(currencyLabels[eventCurrency])}
            onPress={openCurrencyPicker}
          />

          <DateField
            value={selectedDate ? formatDate(selectedDate) : 'dd.mm.yyyy'}
            hasValue={Boolean(selectedDate)}
            onPress={handleOpenDatePicker}
          />
        </ScrollView>

        <BottomActionBar
          bottomInset={insets.bottom}
          onPress={handleSave}
          label={isEditMode ? 'Save changes' : 'Create event'}
          secondaryLabel={isEditMode ? 'Delete' : undefined}
          onSecondaryPress={isEditMode ? () => setIsDeleteConfirmVisible(true) : undefined}
          disabled={name.trim().length === 0}
        />
      </KeyboardAvoidingView>

      <Snackbar visible={errorMessage.length > 0} onDismiss={() => setErrorMessage('')}>
        {errorMessage}
      </Snackbar>

      <AppConfirm
        visible={isDeleteConfirmVisible}
        title="Delete event"
        onDismiss={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleDelete}
        confirmText="Delete"
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          This event and all related expenses, debts, and payments will be deleted.
        </Text>
      </AppConfirm>

      <CurrencyBottomSheet
        sheetRef={currencySheetRef}
        title="Currency"
        options={currencyOptions}
        selectedValue={eventCurrency}
        getLabel={(value) => currencyLabels[value]}
        onSelect={handleSelectCurrency}
        snapPoints={snapPoints}
      />

      {Platform.OS === 'ios' ? (
        <IosDatePickerModal
          visible={datePickerVisible}
          onDismiss={handleCloseDatePicker}
          onDone={handleConfirmDatePicker}
        >
          {DateTimePicker && hasNativeDatePicker ? (
            <DateTimePicker
              key={`${resolvedThemeVariant}-${Platform.OS}`}
              value={draftDate}
              mode="date"
              display="inline"
              themeVariant={resolvedThemeVariant}
              onChange={(_event: unknown, date?: Date) => handleDraftDateChange(date)}
            />
          ) : undefined}
        </IosDatePickerModal>
      ) : null}
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

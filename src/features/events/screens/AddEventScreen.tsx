import React, { useCallback, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsActions } from '../../../state/events/eventsContext';
import { useSettingsState } from '../../../state/settings/settingsContext';
import { normalizeCurrencyCode } from '../../../shared/utils/currency';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { EventNameField } from '../components/add-event/EventNameField';
import { DescriptionField } from '../components/add-event/DescriptionField';
import { CurrencyField } from '../components/add-event/CurrencyField';
import { DateField } from '../components/add-event/DateField';
import { BottomActionBar } from '../components/add-event/BottomActionBar';
import { addEventStyles as featureStyles } from '../components/add-event/styles';
import { CurrencyBottomSheet } from '../components/add-event/CurrencyBottomSheet';
import { IosDatePickerModal } from '../components/add-event/IosDatePickerModal';
import { useEventDatePicker } from '../hooks/useEventDatePicker';
import { useEventCurrency } from '../hooks/useEventCurrency';
import { useDismissBottomSheetsOnBlur } from '../../../shared/hooks/useDismissBottomSheetsOnBlur';

type AddEventScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddEvent'>;

function formatDate(value: Date) {
  const dd = `${value.getDate()}`.padStart(2, '0');
  const mm = `${value.getMonth() + 1}`.padStart(2, '0');
  const yyyy = value.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function AddEventScreen({ navigation }: AddEventScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { createEvent } = useEventsActions();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const currencySheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([currencySheetRef]);
  const {
    selectedDate,
    draftDate,
    datePickerVisible,
    hasNativeDatePicker,
    DateTimePicker,
    resolvedThemeVariant,
    handleOpenDatePicker,
    handleCloseDatePicker,
    handleConfirmDatePicker,
    handleDraftDateChange,
  } = useEventDatePicker({
    themeMode: settings.theme,
    onError: setErrorMessage,
  });
  const { currencyOptions, currencyLabels, eventCurrency, setEventCurrency } = useEventCurrency(settings.currency);
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

  const handleCreate = useCallback(() => {
    try {
      createEvent({
        name,
        description,
        currency: eventCurrency,
        date: selectedDate ? selectedDate.toISOString() : null,
      });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create event.';
      setErrorMessage(message);
    }
  }, [createEvent, description, eventCurrency, name, navigation, selectedDate]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Add Event" onBackPress={handleBack} />

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
          onPress={handleCreate}
          disabled={name.trim().length === 0}
        />
      </KeyboardAvoidingView>

      <Snackbar visible={errorMessage.length > 0} onDismiss={() => setErrorMessage('')}>
        {errorMessage}
      </Snackbar>

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

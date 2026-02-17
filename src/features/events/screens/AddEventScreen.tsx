import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { EventsStackParamList } from '@/navigation/types';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { useSettingsState } from '@/state/settings/settingsContext';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useMessageState } from '@/shared/hooks/useMessageState';
import { normalizeCurrencyCode } from '@/shared/utils/currency';
import { AppHeader } from '@/shared/ui/AppHeader';
import { EventNameField } from '@/features/events/components/add-event/EventNameField';
import { DescriptionField } from '@/features/events/components/add-event/DescriptionField';
import { CurrencyField } from '@/features/events/components/add-event/CurrencyField';
import { GroupField } from '@/features/events/components/add-event/GroupField';
import { DateField } from '@/features/events/components/add-event/DateField';
import { BottomActionBar } from '@/features/events/components/add-event/BottomActionBar';
import { addEventStyles as featureStyles } from '@/features/events/components/add-event/styles';
import { CurrencyBottomSheet } from '@/features/events/components/add-event/CurrencyBottomSheet';
import { IosDatePickerModal } from '@/features/events/components/add-event/IosDatePickerModal';
import { useEventDatePicker } from '@/features/events/hooks/useEventDatePicker';
import { EVENT_CURRENCY_OPTIONS, useEventCurrency } from '@/features/events/hooks/useEventCurrency';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { AppSingleSelectBottomSheet } from '@/shared/ui/AppSingleSelectBottomSheet';
import { AppDeleteConfirm } from '@/shared/ui/AppDeleteConfirm';
import { AppMessageSnackbar } from '@/shared/ui/AppMessageSnackbar';

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
  const { events, groups } = useEventsState();
  const { createEvent, updateEvent, removeEvents } = useEventsActions();
  const routeEventId = route.params?.eventId;
  const routeGroupId = route.params?.groupId;
  const targetEvent = useMemo(
    () => events.find((event) => event.id === routeEventId),
    [events, routeEventId],
  );
  const isEditMode = Boolean(targetEvent);
  const [name, setName] = useState(targetEvent?.name ?? '');
  const [description, setDescription] = useState(targetEvent?.description ?? '');
  const { message: errorMessage, setMessage: setErrorMessage, clearMessage: clearErrorMessage, visible: isErrorVisible } =
    useMessageState();
  const { isVisible: isDeleteConfirmVisible, open: openDeleteConfirm, close: closeDeleteConfirm } =
    useConfirmState();
  const currencySheetRef = useRef<BottomSheetModal>(null);
  const groupSheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([currencySheetRef, groupSheetRef]);
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
  const [eventGroupId, setEventGroupId] = useState<string | undefined>(targetEvent?.groupId ?? routeGroupId);

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
    if (targetEvent.currency) {
      setEventCurrency(targetEvent.currency);
    }
    if (targetEvent.date) {
      const parsed = new Date(targetEvent.date);
      if (!Number.isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
      }
    }
    setEventGroupId(targetEvent.groupId);
  }, [setEventCurrency, setSelectedDate, targetEvent]);
  const snapPoints = useMemo(() => ['40%'], []);
  const groupOptions = useMemo(
    () => [{ value: '__none__', label: 'No group' }, ...groups.map((group) => ({ value: group.id, label: group.name }))],
    [groups],
  );
  const selectedGroupValue = eventGroupId ?? '__none__';
  const selectedGroupLabel = useMemo(() => {
    if (!eventGroupId) {
      return 'No group';
    }
    return groups.find((group) => group.id === eventGroupId)?.name ?? 'No group';
  }, [eventGroupId, groups]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openCurrencyPicker = useCallback(() => {
    currencySheetRef.current?.present();
  }, []);
  const openGroupPicker = useCallback(() => {
    groupSheetRef.current?.present();
  }, []);
  const eventCurrencySheetOptions = useMemo(() => {
    const normalizedSettingsCurrency = normalizeCurrencyCode(settings.currency);
    const base = [...currencyOptions];
    if (
      !EVENT_CURRENCY_OPTIONS.includes(normalizedSettingsCurrency as (typeof EVENT_CURRENCY_OPTIONS)[number]) &&
      !base.includes(normalizedSettingsCurrency)
    ) {
      base.push(normalizedSettingsCurrency);
    }
    return base;
  }, [currencyOptions, settings.currency]);
  const handleSelectCurrency = useCallback(
    (value: string) => {
      setEventCurrency(value);
      currencySheetRef.current?.dismiss();
    },
    [setEventCurrency],
  );
  const handleSelectGroup = useCallback((value: string) => {
    setEventGroupId(value === '__none__' ? undefined : value);
    groupSheetRef.current?.dismiss();
  }, []);

  const handleSave = useCallback(() => {
    try {
      if (targetEvent) {
        updateEvent({
          eventId: targetEvent.id,
          name,
          description,
          currency: eventCurrency,
          date: selectedDate ? selectedDate.toISOString() : null,
          groupId: eventGroupId,
        });
      } else {
        createEvent({
          name,
          description,
          currency: eventCurrency,
          date: selectedDate ? selectedDate.toISOString() : null,
          groupId: eventGroupId,
        });
      }
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Unable to ${targetEvent ? 'update' : 'create'} event.`;
      setErrorMessage(message);
    }
  }, [createEvent, description, eventCurrency, eventGroupId, name, navigation, selectedDate, targetEvent, updateEvent]);

  const handleDelete = useCallback(() => {
    if (!targetEvent) {
      return;
    }
    removeEvents({ eventIds: [targetEvent.id] });
    closeDeleteConfirm();
    navigation.goBack();
  }, [closeDeleteConfirm, navigation, removeEvents, targetEvent]);

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
          <GroupField
            value={selectedGroupLabel}
            onPress={openGroupPicker}
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
          onSecondaryPress={isEditMode ? openDeleteConfirm : undefined}
          disabled={name.trim().length === 0}
        />
      </KeyboardAvoidingView>

      <AppMessageSnackbar
        message={errorMessage}
        visible={isErrorVisible}
        onDismiss={clearErrorMessage}
      />

      <AppDeleteConfirm
        visible={isDeleteConfirmVisible}
        title="Delete event"
        message="This event and all related expenses, debts, and payments will be deleted."
        onDismiss={closeDeleteConfirm}
        onConfirm={handleDelete}
      />

      <CurrencyBottomSheet
        sheetRef={currencySheetRef}
        title="Currency"
        options={eventCurrencySheetOptions}
        selectedValue={eventCurrency}
        getLabel={(value) => currencyLabels[value] ?? normalizeCurrencyCode(value)}
        onSelect={handleSelectCurrency}
        snapPoints={snapPoints}
      />
      <AppSingleSelectBottomSheet
        ref={groupSheetRef}
        title="Group"
        options={groupOptions}
        selectedValue={selectedGroupValue}
        onSelect={handleSelectGroup}
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

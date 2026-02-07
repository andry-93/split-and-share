import React, { useCallback, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, NativeModules, Platform, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { Appbar, Button, Icon, List, Modal, Portal, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsActions } from '../../../state/events/eventsContext';
import { useSettingsActions, useSettingsState } from '../../../state/settings/settingsContext';
import { OutlinedFieldContainer } from '../../../shared/ui/OutlinedFieldContainer';

type AddEventScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddEvent'>;
const currencyOptions = ['USD', 'EUR', 'GBP', 'RUB'] as const;

const currencyLabels: Record<(typeof currencyOptions)[number], string> = {
  USD: '$   USD - US Dollar',
  EUR: 'EUR   EUR - Euro',
  GBP: 'GBP   GBP - British Pound',
  RUB: 'RUB   RUB - Russian Ruble',
};

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
  const { setCurrency } = useSettingsActions();
  const { createEvent } = useEventsActions();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draftDate, setDraftDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const currencySheetRef = useRef<BottomSheetModal>(null);
  const datePickerBlockedUntilRef = useRef<number>(0);
  const hasNativeDatePicker = useMemo(
    () => Boolean((NativeModules as Record<string, unknown>).RNCDatePicker),
    [],
  );
  const DateTimePicker = useMemo(() => {
    try {
      const pickerModule = require('@react-native-community/datetimepicker');
      return pickerModule?.default ?? null;
    } catch (_error) {
      return null;
    }
  }, []);

  const selectedCurrency = useMemo(() => {
    if (currencyOptions.includes(settings.currency as (typeof currencyOptions)[number])) {
      return settings.currency as (typeof currencyOptions)[number];
    }
    return 'USD';
  }, [settings.currency]);
  const systemScheme = useColorScheme() ?? 'dark';
  const resolvedThemeVariant = useMemo<'light' | 'dark'>(
    () => (settings.theme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : settings.theme),
    [settings.theme, systemScheme],
  );
  const snapPoints = useMemo(() => ['40%'], []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openCurrencyPicker = useCallback(() => {
    currencySheetRef.current?.present();
  }, []);

  const handleSelectCurrency = useCallback(
    (value: (typeof currencyOptions)[number]) => {
      setCurrency(value);
      currencySheetRef.current?.dismiss();
    },
    [setCurrency],
  );

  const renderCurrencyOption = useCallback(
    (value: (typeof currencyOptions)[number]) => (
      <CurrencyOptionRow
        key={value}
        value={value}
        selected={selectedCurrency === value}
        onSelect={handleSelectCurrency}
      />
    ),
    [handleSelectCurrency, selectedCurrency],
  );

  const handleOpenDatePicker = useCallback(() => {
    if (Date.now() < datePickerBlockedUntilRef.current) {
      return;
    }
    if (!hasNativeDatePicker || !DateTimePicker) {
      setErrorMessage('Date picker is not linked in this build. Rebuild the app after installing dependency.');
      return;
    }
    if (Platform.OS === 'android') {
      try {
        const pickerModule = require('@react-native-community/datetimepicker');
        if (pickerModule?.DateTimePickerAndroid?.open) {
          pickerModule.DateTimePickerAndroid.open({
            mode: 'date',
            value: selectedDate ?? new Date(),
            themeVariant: resolvedThemeVariant,
            onChange: (event: { type?: string }, date?: Date) => {
              if (event?.type === 'set' && date) {
                setSelectedDate(date);
              }
            },
          });
          return;
        }
      } catch (_error) {
        setErrorMessage('Date picker is not available in this build.');
        return;
      }
    }
    setDraftDate(selectedDate ?? new Date());
    setDatePickerVisible(true);
  }, [DateTimePicker, hasNativeDatePicker, resolvedThemeVariant, selectedDate]);

  const handleCloseDatePicker = useCallback(() => {
    datePickerBlockedUntilRef.current = Date.now() + 350;
    setDatePickerVisible(false);
  }, []);

  const handleConfirmDatePicker = useCallback(() => {
    setSelectedDate(draftDate);
    datePickerBlockedUntilRef.current = Date.now() + 350;
    setDatePickerVisible(false);
  }, [draftDate]);

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
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.outlineVariant }}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Add Event" />
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
            Event name
          </Text>
          <OutlinedFieldContainer style={styles.inputContainer}>
            <TextInput
              value={name}
              onChangeText={setName}
              autoFocus
              mode="flat"
              placeholder="e.g., Weekend Trip"
              style={[styles.inputField, { backgroundColor: 'transparent' }]}
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
              placeholder="Add details about the event (optional)"
              style={[styles.multilineField, { backgroundColor: 'transparent' }]}
              contentStyle={styles.inputContent}
              underlineStyle={styles.hiddenUnderline}
            />
          </OutlinedFieldContainer>

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Currency
          </Text>
          <OutlinedFieldContainer style={styles.selectFieldContainer}>
            <Pressable onPress={openCurrencyPicker} style={styles.selectField}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                {currencyLabels[selectedCurrency]}
              </Text>
              <Icon source="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </OutlinedFieldContainer>

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Date
          </Text>
          <OutlinedFieldContainer style={styles.selectFieldContainer}>
            <Pressable onPress={handleOpenDatePicker} style={styles.selectField}>
              <Text variant="titleMedium" style={{ color: selectedDate ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                {selectedDate ? formatDate(selectedDate) : 'dd.mm.yyyy'}
              </Text>
              <View style={styles.dateIcons}>
                <Icon source="calendar-blank-outline" size={18} color={theme.colors.onSurfaceVariant} />
              </View>
            </Pressable>
          </OutlinedFieldContainer>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.outlineVariant,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
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

      <BottomSheetModal
        ref={currencySheetRef}
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
            Currency
          </Text>
          {currencyOptions.map(renderCurrencyOption)}
        </BottomSheetView>
      </BottomSheetModal>

      {Platform.OS === 'ios' ? (
        <Portal>
          <Modal
            visible={datePickerVisible}
            onDismiss={handleCloseDatePicker}
            contentContainerStyle={[
              styles.iosPickerModal,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
            ]}
          >
            <Text variant="titleMedium" style={styles.iosPickerTitle}>
              Select date
            </Text>
            {DateTimePicker && hasNativeDatePicker ? (
              <DateTimePicker
                key={`${resolvedThemeVariant}-${Platform.OS}`}
                value={draftDate}
                mode="date"
                display="inline"
                themeVariant={resolvedThemeVariant}
                onChange={(_event: unknown, date?: Date) => {
                  if (date) {
                    setDraftDate(date);
                  }
                }}
              />
            ) : (
              <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
                Date picker is not available in this build.
              </Text>
            )}
            <Button mode="contained" onPress={handleConfirmDatePicker}>
              Done
            </Button>
          </Modal>
        </Portal>
      ) : null}
    </SafeAreaView>
  );
}

type CurrencyOptionRowProps = {
  value: (typeof currencyOptions)[number];
  selected: boolean;
  onSelect: (value: (typeof currencyOptions)[number]) => void;
};

const CurrencyOptionRow = React.memo(function CurrencyOptionRow({ value, selected, onSelect }: CurrencyOptionRowProps) {
  const theme = useTheme();
  const handleSelect = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <List.Item
      title={currencyLabels[value]}
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
  selectField: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldContainer: {
    marginBottom: 20,
  },
  dateIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hiddenUnderline: {
    display: 'none',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    marginBottom: 16,
  },
  iosPickerModal: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  iosPickerTitle: {
    textAlign: 'center',
  },
});

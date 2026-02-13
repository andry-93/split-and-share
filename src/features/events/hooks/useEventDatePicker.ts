import { useCallback, useMemo, useRef, useState } from 'react';
import { NativeModules, Platform, useColorScheme } from 'react-native';
import { SettingsState } from '@/state/settings/settingsTypes';

type UseEventDatePickerInput = {
  themeMode: SettingsState['theme'];
  onError: (message: string) => void;
};

type AndroidPickerEvent = {
  type?: string;
};

export function useEventDatePicker({ themeMode, onError }: UseEventDatePickerInput) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draftDate, setDraftDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
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

  const systemScheme = useColorScheme() ?? 'dark';
  const resolvedThemeVariant = useMemo<'light' | 'dark'>(
    () => (themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode),
    [themeMode, systemScheme],
  );

  const handleOpenDatePicker = useCallback(() => {
    if (Date.now() < datePickerBlockedUntilRef.current) {
      return;
    }
    if (!hasNativeDatePicker || !DateTimePicker) {
      onError('Date picker is not linked in this build. Rebuild the app after installing dependency.');
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
            onChange: (event: AndroidPickerEvent, date?: Date) => {
              if (event?.type === 'set' && date) {
                setSelectedDate(date);
              }
            },
          });
          return;
        }
      } catch (_error) {
        onError('Date picker is not available in this build.');
        return;
      }
    }

    setDraftDate(selectedDate ?? new Date());
    setDatePickerVisible(true);
  }, [DateTimePicker, hasNativeDatePicker, onError, resolvedThemeVariant, selectedDate]);

  const handleCloseDatePicker = useCallback(() => {
    datePickerBlockedUntilRef.current = Date.now() + 350;
    setDatePickerVisible(false);
  }, []);

  const handleConfirmDatePicker = useCallback(() => {
    setSelectedDate(draftDate);
    datePickerBlockedUntilRef.current = Date.now() + 350;
    setDatePickerVisible(false);
  }, [draftDate]);

  const handleDraftDateChange = useCallback((date?: Date) => {
    if (date) {
      setDraftDate(date);
    }
  }, []);

  return {
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
  };
}

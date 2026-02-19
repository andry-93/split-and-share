import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSettingsActions, useSettingsState } from '@/state/settings/settingsContext';
import type { SettingsState } from '@/state/settings/settingsTypes';
import {
  getLanguageLabel,
  getOrderedLanguageOptions,
  normalizeLanguageCode,
} from '@/state/settings/languageCatalog';
import { getSystemDefaultLanguage } from '@/state/settings/languageDefaults';
import appPackage from '../../../../package.json';
import { AppConfirm } from '@/shared/ui/AppConfirm';
import { CustomToggleGroup } from '@/shared/ui/CustomToggleGroup';
import {
  getCurrencyDisplay,
  getCurrencyFriendlyLabel,
  getCurrencyOptionLabel,
  getCurrencySymbol,
  normalizeCurrencyCode,
  SUPPORTED_CURRENCY_CODES,
} from '@/shared/utils/currency';
import { AppHeader } from '@/shared/ui/AppHeader';
import { AppSingleSelectBottomSheet } from '@/shared/ui/AppSingleSelectBottomSheet';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { BottomTabSwipeBoundary } from '@/shared/ui/BottomTabSwipeBoundary';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';

const currencyOptions = [...SUPPORTED_CURRENCY_CODES];
const CUSTOM_CURRENCY_VALUE = '__custom_currency__';
const debtsViewOptions: Array<{ value: SettingsState['debtsViewMode']; label: string; description: string }> = [
  {
    value: 'simplified',
    label: 'Simplified',
    description: 'Recommended. Shows the minimum transfers needed.',
  },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Shows full transfer breakdown without simplification.',
  },
];

function validateCustomCurrencyValue(value: string, reservedValues: Set<string>): string | null {
  const raw = value.trim();
  if (!raw) {
    return 'Enter a currency symbol or code.';
  }
  if (raw.length > 10) {
    return 'Currency value must be 1-10 characters.';
  }
  if (reservedValues.has(raw.toUpperCase())) {
    return 'This currency already exists.';
  }
  return null;
}

export function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsState();
  const { setTheme, setLanguage, setCurrency, setDebtsViewMode, resetSettings } = useSettingsActions();
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const currencySheetRef = useRef<BottomSheetModal>(null);
  const debtsViewSheetRef = useRef<BottomSheetModal>(null);
  const [customCurrency, setCustomCurrency] = useState(normalizeCurrencyCode(settings.currency));
  const [customCurrencyDirty, setCustomCurrencyDirty] = useState(false);
  const [customCurrencySubmitAttempted, setCustomCurrencySubmitAttempted] = useState(false);
  const {
    isVisible: isCustomCurrencyVisible,
    open: openCustomCurrency,
    close: closeCustomCurrency,
  } = useConfirmState();
  const {
    isVisible: isResetSettingsVisible,
    open: openResetSettings,
    close: closeResetSettings,
  } = useConfirmState();
  useDismissBottomSheetsOnBlur([languageSheetRef, currencySheetRef, debtsViewSheetRef]);
  const fullHeightSnapPoints = useMemo(() => ['90%'], []);
  const defaultSnapPoints = useMemo(() => ['40%'], []);

  const handleOpenLanguage = useCallback(() => {
    languageSheetRef.current?.present();
  }, []);

  const handleOpenCurrency = useCallback(() => {
    currencySheetRef.current?.present();
  }, []);

  const handleOpenDebtsView = useCallback(() => {
    debtsViewSheetRef.current?.present();
  }, []);
  const systemLanguage = getSystemDefaultLanguage();

  const handleThemeChange = useCallback(
    (value: SettingsState['theme']) => {
      setTheme(value);
    },
    [setTheme],
  );

  const handleSelectLanguage = useCallback(
    (option: string) => {
      setLanguage(normalizeLanguageCode(option));
      languageSheetRef.current?.dismiss();
    },
    [setLanguage],
  );

  const reservedCurrencyValues = useMemo(
    () =>
      new Set(
        currencyOptions.flatMap((code) => {
          const normalized = normalizeCurrencyCode(code);
          const symbol = getCurrencySymbol(normalized);
          return symbol ? [normalized.toUpperCase(), symbol.toUpperCase()] : [normalized.toUpperCase()];
        }),
      ),
    [],
  );

  const handleSelectCurrency = useCallback(
    (option: string) => {
      if (option === CUSTOM_CURRENCY_VALUE) {
        currencySheetRef.current?.dismiss();
        const normalizedCurrent = normalizeCurrencyCode(settings.currency);
        const hasCustomCurrency = !reservedCurrencyValues.has(normalizedCurrent.toUpperCase());
        setCustomCurrency(hasCustomCurrency ? normalizedCurrent : '');
        setCustomCurrencyDirty(false);
        setCustomCurrencySubmitAttempted(false);
        openCustomCurrency();
        return;
      }
      setCurrency(option);
      currencySheetRef.current?.dismiss();
    },
    [openCustomCurrency, reservedCurrencyValues, setCurrency, settings.currency],
  );
  const customCurrencyValidationError = useMemo(
    () => validateCustomCurrencyValue(customCurrency, reservedCurrencyValues),
    [customCurrency, reservedCurrencyValues],
  );
  const shouldShowCustomCurrencyError =
    (customCurrencyDirty || customCurrencySubmitAttempted) && Boolean(customCurrencyValidationError);

  const handleCustomCurrencyChange = useCallback((value: string) => {
    setCustomCurrency(value);
    setCustomCurrencyDirty(true);
  }, []);

  const handleSaveCustomCurrency = useCallback(() => {
    setCustomCurrencySubmitAttempted(true);
    const validationError = validateCustomCurrencyValue(customCurrency, reservedCurrencyValues);
    if (validationError) {
      return;
    }
    const normalized = normalizeCurrencyCode(customCurrency.trim());
    setCurrency(normalized);
    closeCustomCurrency();
  }, [closeCustomCurrency, customCurrency, reservedCurrencyValues, setCurrency]);

  const handleSelectDebtsView = useCallback(
    (option: string) => {
      if (option === 'detailed' || option === 'simplified') {
        setDebtsViewMode(option);
      }
      debtsViewSheetRef.current?.dismiss();
    },
    [setDebtsViewMode],
  );
  const handleResetSettings = useCallback(() => {
    resetSettings();
    closeResetSettings();
  }, [closeResetSettings, resetSettings]);

  const languageSheetOptions = useMemo(
    () =>
      getOrderedLanguageOptions(settings.language, systemLanguage).map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [settings.language, systemLanguage],
  );
  const currencySheetOptions = useMemo(
    () =>
      [
        ...currencyOptions.map((option) => ({
          value: option,
          label: getCurrencyFriendlyLabel(option),
        })),
        { value: CUSTOM_CURRENCY_VALUE, label: 'Custom' },
      ],
    [],
  );
  const debtsViewSheetOptions = useMemo(
    () =>
      debtsViewOptions.map((option) => ({
        value: option.value,
        label: option.label,
        description: option.description,
      })),
    [],
  );

  return (
    <BottomTabSwipeBoundary currentTab="ProfileTab">
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Settings" />

      <View style={styles.content}>
        <Text variant="labelLarge" style={styles.sectionLabel}>
          Preferences
        </Text>
        <View
          style={[
            styles.preferencesContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <List.Item
            title="Language"
            description={getLanguageLabel(settings.language)}
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenLanguage}
          />
          <Divider style={styles.preferencesDivider} />
          <List.Item
            title="Currency"
            description={getCurrencyDisplay(settings.currency)}
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenCurrency}
          />
          <Divider style={styles.preferencesDivider} />
          <List.Item
            title="Debts view"
            description={settings.debtsViewMode === 'detailed' ? 'Detailed' : 'Simplified'}
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenDebtsView}
          />
        </View>

        <Text variant="labelLarge" style={styles.sectionLabel}>
          Appearance
        </Text>
        <CustomToggleGroup
          value={settings.theme}
          onChange={handleThemeChange}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          sizeMode="equal"
          variant="segmented"
        />
        <Text variant="bodySmall" style={[styles.appearanceHint, { color: theme.colors.onSurfaceVariant }]}>
          System follows your device appearance.
        </Text>

        <Text variant="labelLarge" style={styles.sectionLabel}>
          About
        </Text>
        <List.Item title="Version" description={appPackage.version} style={[styles.fullBleedRow, styles.compactRow]} />
        <Button
          mode="contained-tonal"
          icon="restore"
          onPress={openResetSettings}
          style={styles.resetButton}
          contentStyle={styles.resetButtonContent}
          labelStyle={styles.resetButtonLabel}
        >
          Reset settings
        </Button>
        <Text variant="bodySmall" style={[styles.resetHint, { color: theme.colors.onSurfaceVariant }]}>
          Return app preferences to their default values.
        </Text>
      </View>

      <AppSingleSelectBottomSheet
        ref={languageSheetRef}
        title="Language"
        options={languageSheetOptions}
        selectedValue={normalizeLanguageCode(settings.language)}
        onSelect={handleSelectLanguage}
        snapPoints={fullHeightSnapPoints}
      />

      <AppSingleSelectBottomSheet
        ref={currencySheetRef}
        title="Currency"
        options={currencySheetOptions}
        selectedValue={
          currencyOptions.includes(settings.currency as (typeof currencyOptions)[number])
            ? settings.currency
            : CUSTOM_CURRENCY_VALUE
        }
        onSelect={handleSelectCurrency}
        snapPoints={fullHeightSnapPoints}
      />
      <AppSingleSelectBottomSheet
        ref={debtsViewSheetRef}
        title="Debts view"
        options={debtsViewSheetOptions}
        selectedValue={settings.debtsViewMode}
        onSelect={handleSelectDebtsView}
        snapPoints={defaultSnapPoints}
      />
      <AppConfirm
        visible={isCustomCurrencyVisible}
        title="Custom currency"
        onDismiss={closeCustomCurrency}
        onConfirm={handleSaveCustomCurrency}
        confirmText="Save"
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Enter a custom currency symbol or code.
        </Text>
        <OutlinedFieldContainer isError={shouldShowCustomCurrencyError}>
          <RNTextInput
            value={customCurrency}
            onChangeText={handleCustomCurrencyChange}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            style={[styles.customCurrencyInput, { color: theme.colors.onSurface }]}
            placeholder="e.g. $"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            selectionColor={theme.colors.primary}
          />
        </OutlinedFieldContainer>
        {shouldShowCustomCurrencyError ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {customCurrencyValidationError}
          </Text>
        ) : null}
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          1-10 characters.
        </Text>
      </AppConfirm>
      <AppConfirm
        visible={isResetSettingsVisible}
        title="Reset settings"
        onDismiss={closeResetSettings}
        onConfirm={handleResetSettings}
        confirmText="Reset"
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          This will restore app preferences to default values.
        </Text>
      </AppConfirm>
      </SafeAreaView>
    </BottomTabSwipeBoundary>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
    gap: 8,
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 4,
  },
  preferencesContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullBleedRow: {
    marginHorizontal: -16,
  },
  compactRow: {
    minHeight: 56,
    paddingVertical: 4,
  },
  preferencesDivider: {
    marginHorizontal: 16,
  },
  appearanceHint: {
    marginTop: 4,
    marginBottom: 4,
  },
  resetButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  resetButtonContent: {
    minHeight: 46,
  },
  resetButtonLabel: {
    fontWeight: '600',
  },
  resetHint: {
    marginTop: 6,
  },
  customCurrencyInput: {
    height: 50,
    paddingHorizontal: 12,
    fontSize: 18,
  },
});

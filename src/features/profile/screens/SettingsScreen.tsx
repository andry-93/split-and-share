import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, TextInput as RNTextInput } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, List, Text, useTheme, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useSettingsActions, useSettingsState } from '@/state/settings/settingsContext';
import type { SettingsState } from '@/state/settings/settingsTypes';
import {
  getLanguageLocale,
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
  getCurrencyName,
  getCurrencyOptionLabel,
  getCurrencySymbol,
  normalizeCurrencyCode,
  SUPPORTED_CURRENCY_CODES,
} from '@/shared/utils/currency';
import { getSystemDefaultCurrency } from '@/state/settings/currencyDefaults';
import { AppHeader } from '@/shared/ui/AppHeader';
import { AppSingleSelectBottomSheet } from '@/shared/ui/AppSingleSelectBottomSheet';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { BottomTabSwipeBoundary } from '@/shared/ui/BottomTabSwipeBoundary';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { setMasterPassword as saveMasterPassword, deleteMasterPassword } from '@/state/storage/securityStore';
import { usePeopleActions } from '@/state/people/peopleContext';
import { useEventsActions } from '@/state/events/eventsContext';

const currencyOptions = [...SUPPORTED_CURRENCY_CODES];
const CUSTOM_CURRENCY_VALUE = '__custom_currency__';
const SYSTEM_LANGUAGE_VALUE = '__system_language__';
const SYSTEM_CURRENCY_VALUE = '__system_currency__';
const debtsViewOptions: Array<{ value: SettingsState['debtsViewMode']; label: string; description: string }> = [
  {
    value: 'simplified',
    label: 'simplified',
    description: 'simplifiedDescription',
  },
  {
    value: 'detailed',
    label: 'detailed',
    description: 'detailedDescription',
  },
];
const numberFormatOptions: Array<{ value: SettingsState['numberFormat']; labelKey: string }> = [
  { value: 'system', labelKey: 'common.system_masculine' },
  { value: 'us', labelKey: 'settings.numberFormatUS' },
  { value: 'eu', labelKey: 'settings.numberFormatEU' },
  { value: 'ru', labelKey: 'settings.numberFormatRU' },
  { value: 'ch', labelKey: 'settings.numberFormatCH' },
];
const autoLockOptions: Array<{ value: number; labelKey: string }> = [
  { value: 0, labelKey: 'settings.autoLockImmediate' },
  { value: 15000, labelKey: 'settings.autoLock15s' },
  { value: 30000, labelKey: 'settings.autoLock30s' },
  { value: 60000, labelKey: 'settings.autoLock1m' },
  { value: 120000, labelKey: 'settings.autoLock2m' },
  { value: 300000, labelKey: 'settings.autoLock5m' },
];

function formatNumberExample(mode: SettingsState['numberFormat']) {
  const value = 1234.56;
  if (mode === 'us') {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
  if (mode === 'eu') {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
  if (mode === 'ru') {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
  if (mode === 'ch') {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function validateCustomCurrencyValue(value: string, reservedValues: Set<string>): string | null {
  const raw = value.trim();
  if (!raw) {
    return 'settings.customCurrencyErrors.enterValue';
  }
  if (raw.length > 10) {
    return 'settings.customCurrencyErrors.length';
  }
  if (reservedValues.has(raw.toUpperCase())) {
    return 'settings.customCurrencyErrors.exists';
  }
  return null;
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const settings = useSettingsState();
  const {
    setTheme,
    setLanguage,
    setLanguageSystem,
    setNumberFormat,
    setCurrency,
    setCurrencySystem,
    setDebtsViewMode,
    setSecurityEnabled,
    setBiometricsEnabled,
    setMasterPasswordHash,
    setAutoLockGracePeriod,
    resetSettings,
  } = useSettingsActions();
  const { resetPeople } = usePeopleActions();
  const { resetEvents } = useEventsActions();
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const numberFormatSheetRef = useRef<BottomSheetModal>(null);
  const currencySheetRef = useRef<BottomSheetModal>(null);
  const debtsViewSheetRef = useRef<BottomSheetModal>(null);
  const autoLockSheetRef = useRef<BottomSheetModal>(null);
  const [customCurrency, setCustomCurrency] = useState(normalizeCurrencyCode(settings.currency));
  const [customCurrencyDirty, setCustomCurrencyDirty] = useState(false);
  const [customCurrencySubmitAttempted, setCustomCurrencySubmitAttempted] = useState(false);
  
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupPasswordError, setSetupPasswordError] = useState<string | null>(null);
  const [isFinishingSecuritySetup, setIsFinishingSecuritySetup] = useState(false);
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
  const {
    isVisible: isClearDataVisible,
    open: openClearData,
    close: closeClearData,
  } = useConfirmState();
  const {
    isVisible: isSetupMasterPasswordVisible,
    open: openSetupMasterPassword,
    close: closeSetupMasterPassword,
  } = useConfirmState();

  const handleClearData = useCallback(() => {
    // 1. Reset Settings
    resetSettings();
    // 2. Clear People
    resetPeople();
    // 3. Clear Events
    resetEvents();
    // 4. Delete Master Password
    void deleteMasterPassword();
    
    closeClearData();
  }, [closeClearData, resetSettings, resetPeople, resetEvents]);

  useDismissBottomSheetsOnBlur([languageSheetRef, numberFormatSheetRef, currencySheetRef, debtsViewSheetRef, autoLockSheetRef]);
  const fullHeightSnapPoints = useMemo(() => ['90%'], []);
  const defaultSnapPoints = useMemo(() => ['40%'], []);

  const handleOpenLanguage = useCallback(() => {
    languageSheetRef.current?.present();
  }, []);

  const handleOpenCurrency = useCallback(() => {
    currencySheetRef.current?.present();
  }, []);
  const handleOpenNumberFormat = useCallback(() => {
    numberFormatSheetRef.current?.present();
  }, []);

  const handleOpenDebtsView = useCallback(() => {
    debtsViewSheetRef.current?.present();
  }, []);

  const handleOpenAutoLock = useCallback(() => {
    autoLockSheetRef.current?.present();
  }, []);
  const systemLanguage = getSystemDefaultLanguage();
  const systemCurrency = getSystemDefaultCurrency();
  const languageLocale = useMemo(() => getLanguageLocale(settings.language), [settings.language]);

  const handleThemeChange = useCallback(
    (value: SettingsState['theme']) => {
      setTheme(value);
    },
    [setTheme],
  );

  const handleSelectLanguage = useCallback(
    (option: string) => {
      if (option === SYSTEM_LANGUAGE_VALUE) {
        setLanguageSystem();
        languageSheetRef.current?.dismiss();
        return;
      }
      setLanguage(normalizeLanguageCode(option));
      languageSheetRef.current?.dismiss();
    },
    [setLanguage, setLanguageSystem],
  );
  const handleSelectNumberFormat = useCallback(
    (option: string) => {
      if (
        option === 'system' ||
        option === 'us' ||
        option === 'eu' ||
        option === 'ru' ||
        option === 'ch'
      ) {
        setNumberFormat(option);
      }
      numberFormatSheetRef.current?.dismiss();
    },
    [setNumberFormat],
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
      if (option === SYSTEM_CURRENCY_VALUE) {
        setCurrencySystem();
        currencySheetRef.current?.dismiss();
        return;
      }
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
    [openCustomCurrency, reservedCurrencyValues, setCurrency, setCurrencySystem, settings.currency],
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
    void deleteMasterPassword();
  }, [closeResetSettings, resetSettings]);

  const handleToggleSecurity = useCallback(() => {
    if (settings.isSecurityEnabled) {
      setSecurityEnabled(false);
      setBiometricsEnabled(false);
    } else {
      // If no master password set, need to set it first
      if (!settings.masterPasswordHash) {
        setSetupPassword('');
        setConfirmPassword('');
        setSetupPasswordError(null);
        openSetupMasterPassword();
      } else {
        setSecurityEnabled(true);
      }
    }
  }, [settings.isSecurityEnabled, settings.masterPasswordHash, setSecurityEnabled, setBiometricsEnabled, openSetupMasterPassword]);

  const handleSaveMasterPassword = useCallback(async () => {
    if (setupPassword.length < 4) {
      setSetupPasswordError('settings.passwordMinLength');
      return;
    }
    if (setupPassword !== confirmPassword) {
      setSetupPasswordError('settings.passwordsDoNotMatch');
      return;
    }

    setIsFinishingSecuritySetup(true);
    try {
      await saveMasterPassword(setupPassword);
      setMasterPasswordHash('SET'); // Mark as set
      setSecurityEnabled(true);
      closeSetupMasterPassword();
    } catch (e) {
      console.error('[Security] Failed to save master password:', e);
    } finally {
      setIsFinishingSecuritySetup(false);
    }
  }, [setupPassword, confirmPassword, setMasterPasswordHash, setSecurityEnabled, closeSetupMasterPassword]);

  const handleToggleBiometrics = useCallback(() => {
    setBiometricsEnabled(!settings.isBiometricsEnabled);
  }, [settings.isBiometricsEnabled, setBiometricsEnabled]);

  const handleSelectAutoLock = useCallback((option: string) => {
    setAutoLockGracePeriod(parseInt(option, 10));
    autoLockSheetRef.current?.dismiss();
  }, [setAutoLockGracePeriod]);

  const languageSheetOptions = useMemo(
    () => [
      {
        value: SYSTEM_LANGUAGE_VALUE,
          label: t('common.system_masculine'),
          description: getLanguageLabel(systemLanguage),
      },
      ...getOrderedLanguageOptions(settings.language, systemLanguage).map((option) => ({
        value: option.value,
        label: option.label,
      })),
    ],
    [settings.language, systemLanguage, t],
  );
  const currencySheetOptions = useMemo(
    () =>
      [
        {
          value: SYSTEM_CURRENCY_VALUE,
          label: t('common.system_feminine'),
          description: `${getCurrencyOptionLabel(systemCurrency, languageLocale)} • ${getCurrencyName(systemCurrency, languageLocale)}`,
        },
        ...currencyOptions.map((option) => ({
          value: option,
          label: getCurrencyOptionLabel(option, languageLocale),
          description: getCurrencyName(option, languageLocale),
        })),
        { value: CUSTOM_CURRENCY_VALUE, label: t('common.custom'), description: t('settings.setOwnCodeOrSymbol') },
      ],
    [languageLocale, systemCurrency, t],
  );
  const autoLockSheetOptions = useMemo(
    () =>
      autoLockOptions.map((option) => ({
        value: option.value.toString(),
        label: t(option.labelKey),
      })),
    [t],
  );

  const numberFormatSheetOptions = useMemo(
    () =>
      numberFormatOptions.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
        description: formatNumberExample(option.value),
      })),
    [t],
  );

  const debtsViewSheetOptions = useMemo(
    () =>
      debtsViewOptions.map((option) => ({
        value: option.value,
        label: t(`settings.${option.label}`),
        description: t(`settings.debtsViewDescription${option.description === 'simplifiedDescription' ? 'Simplified' : 'Detailed'}`),
      })),
    [t],
  );
  
  return (
    <BottomTabSwipeBoundary currentTab="ProfileTab">
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title={t('settings.title')} />
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="labelLarge" style={styles.sectionLabel}>
          {t('settings.preferences')}
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
            title={t('common.language')}
            description={
              settings.languageSource === 'system'
                ? t('settings.systemWithValue_masculine', { value: getLanguageLabel(settings.language) })
                : getLanguageLabel(settings.language)
            }
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenLanguage}
          />
          <Divider style={styles.preferencesDivider} />
          <List.Item
            title={t('common.currency')}
            description={
              settings.currencySource === 'system'
                ? t('settings.systemWithValue_feminine', { value: getCurrencyDisplay(settings.currency, languageLocale) })
                : getCurrencyDisplay(settings.currency, languageLocale)
            }
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenCurrency}
          />
          <Divider style={styles.preferencesDivider} />
          <List.Item
            title={t('settings.numberFormat')}
            description={
              settings.numberFormat === 'system'
                ? t('settings.systemWithValue_masculine', { value: formatNumberExample('system') })
                : t(numberFormatOptions.find((option) => option.value === settings.numberFormat)?.labelKey ?? 'common.system_masculine')
            }
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenNumberFormat}
          />
          <Divider style={styles.preferencesDivider} />
          <List.Item
            title={t('settings.debtsView')}
            description={settings.debtsViewMode === 'detailed' ? t('settings.detailed') : t('settings.simplified')}
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenDebtsView}
          />
        </View>

        <Text variant="labelLarge" style={styles.sectionLabel}>
          {t('settings.appearance')}
        </Text>
        <CustomToggleGroup
          value={settings.theme}
          onChange={handleThemeChange}
          options={[
            { value: 'system', label: t('common.system_feminine') },
            { value: 'light', label: t('common.light') },
            { value: 'dark', label: t('common.dark') },
          ]}
          sizeMode="equal"
          variant="segmented"
        />
        {settings.theme === 'system' && (
          <Text variant="bodySmall" style={[styles.appearanceHint, { color: theme.colors.onSurfaceVariant }]}>
            {t('settings.systemFollowsDevice')}
          </Text>
        )}

        <Text variant="labelLarge" style={styles.sectionLabel}>
          {t('settings.security')}
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
            title={t('settings.enableSecurity')}
            description={t('settings.enableSecurityHint')}
            style={styles.compactRow}
            right={() => (
              <Switch
                value={settings.isSecurityEnabled}
                onValueChange={handleToggleSecurity}
              />
            )}
          />
          {settings.isSecurityEnabled && (
            <>
              <Divider style={styles.preferencesDivider} />
              <List.Item
                title={t('settings.biometrics')}
                description={t('settings.biometricsHint')}
                style={styles.compactRow}
                right={() => (
                  <Switch
                    value={settings.isBiometricsEnabled}
                    onValueChange={handleToggleBiometrics}
                  />
                )}
              />
              <Divider style={styles.preferencesDivider} />
              <List.Item
                title={t('settings.autoLock')}
                description={t(autoLockOptions.find(o => o.value === settings.autoLockGracePeriod)?.labelKey ?? 'settings.autoLockImmediate')}
                style={styles.compactRow}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleOpenAutoLock}
              />
              <Divider style={styles.preferencesDivider} />
              <List.Item
                title={t('settings.changeMasterPassword')}
                description={t('settings.masterPasswordHint')}
                style={styles.compactRow}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {
                  setSetupPassword('');
                  setConfirmPassword('');
                  setSetupPasswordError(null);
                  openSetupMasterPassword();
                }}
              />
            </>
          )}
        </View>

        <Text variant="labelLarge" style={styles.sectionLabel}>
          {t('settings.about')}
        </Text>
        <List.Item title={t('settings.version')} description={appPackage.version} style={[styles.fullBleedRow, styles.compactRow]} />
        <Button
          mode="contained-tonal"
          icon="restore"
          onPress={openResetSettings}
          style={styles.resetButton}
          contentStyle={styles.resetButtonContent}
          labelStyle={styles.resetButtonLabel}
          buttonColor={theme.colors.primaryContainer}
          textColor={theme.colors.onPrimaryContainer}
        >
          {t('settings.resetSettings')}
        </Button>
        <Text variant="bodySmall" style={[styles.resetHint, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.resetSettingsHint')}
        </Text>

        <Divider style={styles.sectionDivider} />

        <Button
          mode="contained-tonal"
          icon="delete-sweep"
          onPress={openClearData}
          style={styles.clearButton}
          contentStyle={styles.resetButtonContent}
          labelStyle={styles.resetButtonLabel}
          buttonColor={theme.colors.errorContainer}
          textColor={theme.colors.onErrorContainer}
        >
          {t('settings.clearData')}
        </Button>
        <Text variant="bodySmall" style={[styles.resetHint, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.clearDataHint')}
        </Text>
      </ScrollView>

      <AppSingleSelectBottomSheet
        ref={languageSheetRef}
        title={t('common.language')}
        options={languageSheetOptions}
        selectedValue={
          settings.languageSource === 'system'
            ? SYSTEM_LANGUAGE_VALUE
            : normalizeLanguageCode(settings.language)
        }
        onSelect={handleSelectLanguage}
        snapPoints={fullHeightSnapPoints}
      />

      <AppSingleSelectBottomSheet
        ref={numberFormatSheetRef}
        title={t('settings.numberFormat')}
        options={numberFormatSheetOptions}
        selectedValue={settings.numberFormat}
        onSelect={handleSelectNumberFormat}
        snapPoints={defaultSnapPoints}
      />
      <AppSingleSelectBottomSheet
        ref={currencySheetRef}
        title={t('common.currency')}
        options={currencySheetOptions}
        selectedValue={
          settings.currencySource === 'system'
            ? SYSTEM_CURRENCY_VALUE
            : currencyOptions.includes(settings.currency as (typeof currencyOptions)[number])
            ? settings.currency
            : CUSTOM_CURRENCY_VALUE
        }
        onSelect={handleSelectCurrency}
        snapPoints={fullHeightSnapPoints}
      />
      <AppSingleSelectBottomSheet
        ref={debtsViewSheetRef}
        title={t('settings.debtsView')}
        options={debtsViewSheetOptions}
        selectedValue={settings.debtsViewMode}
        onSelect={handleSelectDebtsView}
        snapPoints={defaultSnapPoints}
      />
      <AppConfirm
        visible={isCustomCurrencyVisible}
        title={t('settings.customCurrency')}
        onDismiss={closeCustomCurrency}
        onConfirm={handleSaveCustomCurrency}
        confirmText={t('common.save')}
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('settings.customCurrencyHint')}
        </Text>
        <OutlinedFieldContainer isError={shouldShowCustomCurrencyError}>
          <RNTextInput
            value={customCurrency}
            onChangeText={handleCustomCurrencyChange}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            style={[styles.customCurrencyInput, { color: theme.colors.onSurface }]}
            placeholder={t('settings.customCurrencyPlaceholder')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            selectionColor={theme.colors.primary}
          />
        </OutlinedFieldContainer>
        {shouldShowCustomCurrencyError ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {customCurrencyValidationError ? t(customCurrencyValidationError) : ''}
          </Text>
        ) : null}
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('settings.customCurrencyChars')}
        </Text>
      </AppConfirm>
      <AppConfirm
        visible={isResetSettingsVisible}
        title={t('settings.resetSettings')}
        onDismiss={closeResetSettings}
        onConfirm={handleResetSettings}
        confirmText={t('common.reset')}
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('settings.resetSettingsConfirm')}
        </Text>
      </AppConfirm>

      <AppConfirm
        visible={isSetupMasterPasswordVisible}
        title={t('settings.setupMasterPasswordTitle')}
        onDismiss={closeSetupMasterPassword}
        onConfirm={handleSaveMasterPassword}
        confirmText={t('common.save')}
        loading={isFinishingSecuritySetup}
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          {t('settings.setupMasterPasswordDescription')}
        </Text>
        
        <View style={{ gap: 12 }}>
          <OutlinedFieldContainer isError={!!setupPasswordError}>
            <RNTextInput
              value={setupPassword}
              onChangeText={(text) => {
                setSetupPassword(text);
                setSetupPasswordError(null);
              }}
              secureTextEntry
              autoFocus
              placeholder={t('settings.passwordPlaceholder')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              style={[styles.customCurrencyInput, { color: theme.colors.onSurface }]}
            />
          </OutlinedFieldContainer>

          <OutlinedFieldContainer isError={!!setupPasswordError}>
            <RNTextInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setSetupPasswordError(null);
              }}
              secureTextEntry
              placeholder={t('settings.confirmPasswordPlaceholder')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              style={[styles.customCurrencyInput, { color: theme.colors.onSurface }]}
            />
          </OutlinedFieldContainer>

          {setupPasswordError && (
            <Text variant="bodySmall" style={{ color: theme.colors.error }}>
              {t(setupPasswordError)}
            </Text>
          )}

          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('settings.passwordMinLength')}
          </Text>
        </View>
      </AppConfirm>

      <AppConfirm
        visible={isClearDataVisible}
        title={t('settings.clearData')}
        onDismiss={closeClearData}
        onConfirm={handleClearData}
        confirmText={t('common.delete')}
        confirmButtonProps={{ mode: 'contained', buttonColor: theme.colors.error }}
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('settings.clearDataConfirm')}
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
  sectionDivider: {
    marginVertical: 16,
    opacity: 0.5,
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
  clearButton: {
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

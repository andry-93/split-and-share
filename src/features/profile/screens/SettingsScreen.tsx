import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSettingsActions, useSettingsState } from '../../../state/settings/settingsContext';
import type { SettingsState } from '../../../state/settings/settingsTypes';
import appPackage from '../../../../package.json';
import { CustomToggleGroup } from '../../../shared/ui/CustomToggleGroup';
import { normalizeCurrencyCode } from '../../../shared/utils/currency';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { AppSingleSelectBottomSheet } from '../../../shared/ui/AppSingleSelectBottomSheet';
import { useDismissBottomSheetsOnBlur } from '../../../shared/hooks/useDismissBottomSheetsOnBlur';

const languageOptions = ['English', 'German', 'Spanish', 'French', 'Russian'];
const currencyOptions = ['USD', 'EUR', 'GBP', 'RUB'];

export function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsState();
  const { setTheme, setLanguage, setCurrency } = useSettingsActions();
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const currencySheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([languageSheetRef, currencySheetRef]);
  const snapPoints = useMemo(() => ['40%'], []);

  const handleOpenLanguage = useCallback(() => {
    languageSheetRef.current?.present();
  }, []);

  const handleOpenCurrency = useCallback(() => {
    currencySheetRef.current?.present();
  }, []);

  const handleThemeChange = useCallback(
    (value: SettingsState['theme']) => {
      setTheme(value);
    },
    [setTheme],
  );

  const handleSelectLanguage = useCallback(
    (option: string) => {
      setLanguage(option);
      languageSheetRef.current?.dismiss();
    },
    [setLanguage],
  );

  const handleSelectCurrency = useCallback(
    (option: string) => {
      setCurrency(option);
      currencySheetRef.current?.dismiss();
    },
    [setCurrency],
  );

  const languageSheetOptions = useMemo(
    () => languageOptions.map((option) => ({ value: option, label: option })),
    [],
  );
  const currencySheetOptions = useMemo(
    () =>
      currencyOptions.map((option) => ({
        value: option,
        label: normalizeCurrencyCode(option),
      })),
    [],
  );

  return (
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
            description={settings.language}
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenLanguage}
          />
          <Divider style={styles.preferencesDivider} />
          <List.Item
            title="Currency"
            description={normalizeCurrencyCode(settings.currency)}
            style={styles.compactRow}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenCurrency}
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
      </View>

      <AppSingleSelectBottomSheet
        ref={languageSheetRef}
        title="Language"
        options={languageSheetOptions}
        selectedValue={settings.language}
        onSelect={handleSelectLanguage}
        snapPoints={snapPoints}
      />

      <AppSingleSelectBottomSheet
        ref={currencySheetRef}
        title="Currency"
        options={currencySheetOptions}
        selectedValue={settings.currency}
        onSelect={handleSelectCurrency}
        snapPoints={snapPoints}
      />
    </SafeAreaView>
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
});

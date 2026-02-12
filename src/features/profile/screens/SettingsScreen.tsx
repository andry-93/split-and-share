import React, { memo, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSettingsActions, useSettingsState } from '../../../state/settings/settingsContext';
import type { SettingsState } from '../../../state/settings/settingsTypes';
import appPackage from '../../../../package.json';
import { CustomToggleGroup } from '../../../shared/ui/CustomToggleGroup';
import { BottomSheetSingleSelectRow } from '../../../shared/ui/BottomSheetSingleSelectRow';
import { normalizeCurrencyCode } from '../../../shared/utils/currency';
import { AppHeader } from '../../../shared/ui/AppHeader';

const languageOptions = ['English', 'German', 'Spanish', 'French', 'Russian'];
const currencyOptions = ['USD', 'EUR', 'GBP', 'RUB'];

export function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsState();
  const { setTheme, setLanguage, setCurrency } = useSettingsActions();
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const currencySheetRef = useRef<BottomSheetModal>(null);
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

  const renderLanguageOption = useCallback(
    (option: string, index: number) => (
      <OptionRow
        key={option}
        title={option}
        value={option}
        selected={settings.language === option}
        onSelect={handleSelectLanguage}
        isLast={index === languageOptions.length - 1}
      />
    ),
    [handleSelectLanguage, settings.language],
  );

  const renderCurrencyOption = useCallback(
    (option: string, index: number) => (
      <OptionRow
        key={option}
        title={normalizeCurrencyCode(option)}
        value={option}
        selected={settings.currency === option}
        onSelect={handleSelectCurrency}
        isLast={index === currencyOptions.length - 1}
      />
    ),
    [handleSelectCurrency, settings.currency],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Settings" />

      <View style={styles.content}>
        <Text variant="labelLarge" style={styles.sectionLabel}>
          Preferences
        </Text>
        <List.Item
          title="Language"
          description={settings.language}
          style={[styles.fullBleedRow, styles.compactRow]}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleOpenLanguage}
        />
        <Divider style={styles.fullBleedDivider} />
        <List.Item
          title="Currency"
          description={normalizeCurrencyCode(settings.currency)}
          style={[styles.fullBleedRow, styles.compactRow]}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleOpenCurrency}
        />

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

      <BottomSheetModal
        ref={languageSheetRef}
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
            Language
          </Text>
          {languageOptions.map(renderLanguageOption)}
        </BottomSheetView>
      </BottomSheetModal>

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
    </SafeAreaView>
  );
}

type OptionRowProps = {
  title: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  isLast: boolean;
};

const OptionRow = memo(function OptionRow({ title, value, selected, onSelect, isLast }: OptionRowProps) {
  const handleSelect = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <BottomSheetSingleSelectRow
      label={title}
      selected={selected}
      onPress={handleSelect}
      isLast={isLast}
    />
  );
});

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
  fullBleedRow: {
    marginHorizontal: -16,
  },
  compactRow: {
    minHeight: 56,
    paddingVertical: 4,
  },
  fullBleedDivider: {
    marginHorizontal: -16,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sheetTitle: {
    marginBottom: 8,
  },
  appearanceHint: {
    marginTop: 4,
    marginBottom: 4,
  },
});

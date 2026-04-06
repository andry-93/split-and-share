import React, { useCallback, useMemo, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useTheme, Text } from 'react-native-paper';
import { EventsStackParamList } from '@/navigation/types';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { useSettingsState } from '@/state/settings/settingsContext';
import { AppHeader } from '@/shared/ui/AppHeader';
import { useMessageState } from '@/shared/hooks/useMessageState';
import { usePoolTransferForm } from '@/features/events/hooks/usePoolTransferForm';
import { AppSingleSelectBottomSheet } from '@/shared/ui/AppSingleSelectBottomSheet';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { addExpenseStyles as featureStyles } from '@/features/events/components/add-expense/styles';
import { AmountField } from '@/features/events/components/add-expense/AmountField';
import { ManagePoolContributorField } from '@/features/events/components/manage-pool/ManagePoolContributorField';
import { BottomActionBar } from '@/features/events/components/add-expense/BottomActionBar';
import { AppMessageSnackbar } from '@/shared/ui/AppMessageSnackbar';

type PoolTransferScreenProps = NativeStackScreenProps<EventsStackParamList, 'PoolTransfer'>;

export function PoolTransferScreen({ navigation, route }: PoolTransferScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events } = useEventsState();
  const { registerPayment } = useEventsActions();

  const eventId = route.params.eventId;
  const poolId = route.params.poolId;

  const event = useMemo(
    () => events.find((e) => e.id === eventId),
    [eventId, events],
  );
  
  const pool = useMemo(
    () => event?.pools?.find((p) => p.id === poolId),
    [event?.pools, poolId],
  );

  const {
    amount,
    setAmount,
    contributorId,
    setContributorId,
    contributorOptions,
    selectedCurrencyCode,
    contributorName,
    isExpression,
    calculationResult,
    parsedAmountMinor,
    isSaveDisabled,
  } = usePoolTransferForm({
    participants: event?.participants ?? [],
    currency: event?.currency,
    fallbackCurrency: settings.currency,
  });

  const sheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([sheetRef]);

  const {
    message: errorMessage,
    setMessage: setErrorMessage,
    clearMessage: clearErrorMessage,
    visible: isErrorVisible,
  } = useMessageState();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openContributorPicker = useCallback(() => {
    Keyboard.dismiss();
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const handleSelectContributor = useCallback(
    (id: string) => {
      setContributorId(id);
      sheetRef.current?.dismiss();
    },
    [setContributorId],
  );

  const contributorPickerOptions = useMemo(
    () => contributorOptions.map((o) => ({ value: o.id, label: o.name })),
    [contributorOptions],
  );

  const handleSave = useCallback(() => {
    try {
      if (parsedAmountMinor > 0 && poolId) {
        registerPayment({
          eventId,
          fromId: contributorId,
          toId: poolId, // Depositing money to the pool
          amountMinor: parsedAmountMinor,
          source: 'detailed',
        });
      }
      navigation.goBack();
    } catch (error) {
      setErrorMessage(t('common.error'));
    }
  }, [
    poolId,
    eventId,
    parsedAmountMinor,
    contributorId,
    registerPayment,
    navigation,
    t,
    setErrorMessage,
  ]);

  const handleApplyResult = useCallback(
    (result: number) => {
      setAmount(result.toString());
    },
    [setAmount],
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <AppHeader
        title={t('events.pools.addFunds')}
        onBackPress={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[featureStyles.form, { paddingBottom: 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={featureStyles.section}>
            <Text variant="labelLarge" style={[featureStyles.sectionLabel, { marginBottom: 4 }]}>
              {pool?.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              {t('events.pools.fundingDescription')}
            </Text>
            
            <AmountField
              currencyCode={selectedCurrencyCode}
              value={amount}
              onChangeText={setAmount}
              isExpression={isExpression}
              calculationResult={calculationResult}
              onApplyResult={handleApplyResult}
              label={t('events.pools.addFunds')}
            />

            <ManagePoolContributorField
              label={t('events.pools.whoIsContributing')}
              contributorName={contributorName}
              onPress={openContributorPicker}
            />
          </View>
        </ScrollView>

        <BottomActionBar
          onSave={handleSave}
          disabled={isSaveDisabled}
          bottomInset={insets.bottom}
          label={t('events.pools.saveDeposit')}
        />
      </KeyboardAvoidingView>

      <AppMessageSnackbar message={errorMessage} visible={isErrorVisible} onDismiss={clearErrorMessage} />

      <AppSingleSelectBottomSheet
        ref={sheetRef}
        title={t('events.pools.whoIsContributing')}
        options={contributorPickerOptions}
        selectedValue={contributorId}
        onSelect={handleSelectContributor}
        snapPoints={['40%']}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
});

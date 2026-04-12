import React, { useCallback, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { EventsStackParamList } from '@/navigation/types';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { useSettingsState } from '@/state/settings/settingsContext';
import { AppHeader } from '@/shared/ui/AppHeader';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useMessageState } from '@/shared/hooks/useMessageState';
import { useManagePoolForm } from '@/features/events/hooks/useManagePoolForm';
import { addExpenseStyles as featureStyles } from '@/features/events/components/add-expense/styles';
import { ManagePoolNameField } from '@/features/events/components/manage-pool/ManagePoolNameField';
import { Shadows } from '@/shared/ui/theme/styles';
import { ManagePoolContributorsField } from '@/features/events/components/manage-pool/ManagePoolContributorsField';
import { BottomActionBar } from '@/features/events/components/add-expense/BottomActionBar';
import { AppDeleteConfirm } from '@/shared/ui/AppDeleteConfirm';
import { AppMessageSnackbar } from '@/shared/ui/AppMessageSnackbar';
import { getCurrencyDisplay } from '@/shared/utils/currency';
import { formatCurrencyAmount } from '@/shared/utils/money';
import { fromMinorUnits } from '@/domain/finance/minorUnits';

type ManagePoolScreenProps = NativeStackScreenProps<EventsStackParamList, 'ManagePool'>;

export function ManagePoolScreen({ navigation, route }: ManagePoolScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const eventsState = useEventsState();
  const { events } = eventsState;
  const { addPool, updatePool, removePool } = useEventsActions();
  const settings = useSettingsState();

  const eventId = route.params.eventId;
  const poolId = route.params.poolId;
  const event = useMemo(
    () => events.find((e) => e.id === eventId),
    [eventId, events],
  );

  const editingPool = useMemo(
    () => event?.pools?.find((p) => p.id === poolId),
    [event?.pools, poolId],
  );

  const isEditMode = Boolean(editingPool);

  const eventPayments = useMemo(
    () => eventsState.paymentsByEvent[eventId] ?? [],
    [eventId, eventsState.paymentsByEvent],
  );

  const initialContributions = useMemo(() => {
    const rawPayments = eventPayments.filter((p) => p.toId === poolId);
    
    const merged = new Map<string, typeof rawPayments[0]>();
    for (const p of rawPayments) {
      const existing = merged.get(p.fromId);
      if (existing) {
        existing.amountMinor += p.amountMinor;
      } else {
        merged.set(p.fromId, { ...p });
      }
    }
    
    return Array.from(merged.values());
  }, [eventPayments, poolId]);


  const {
    name,
    setName,
    contributions,
    virtualTotalMinor,
    updateContributionAmount,
    removeContributor,
    addContributor,
    isSaveDisabled,
  } = useManagePoolForm({
    eventId,
    poolId,
    initialName: editingPool?.name ?? '',
    initialContributions,
  });

  const {
    message: errorMessage,
    setMessage: setErrorMessage,
    clearMessage: clearErrorMessage,
    visible: isErrorVisible,
  } = useMessageState();
  const {
    isVisible: isDeleteConfirmVisible,
    open: openDeleteConfirm,
    close: closeDeleteConfirm,
  } = useConfirmState();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(() => {
    try {
      if (isEditMode && poolId) {
        updatePool({ eventId, poolId, name, contributions });
      } else {
        addPool({ eventId, name, id: poolId, contributions });
      }
      navigation.goBack();
    } catch (error) {
      setErrorMessage(t('common.error'));
    }
  }, [isEditMode, poolId, eventId, name, contributions, addPool, updatePool, navigation, t, setErrorMessage]);

  const handleDelete = useCallback(() => {
    if (poolId) {
      removePool({ eventId, poolIds: [poolId] });
      navigation.goBack();
    }
  }, [eventId, poolId, removePool, navigation]);

  const handleAddContributor = useCallback(() => {
    if (poolId) {
      navigation.navigate('PoolTransfer', { eventId, poolId });
    }
  }, [navigation, eventId, poolId]);

  const currencyCode = useMemo(
    () => getCurrencyDisplay(event?.currency ?? settings.currency),
    [event?.currency, settings.currency],
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <AppHeader
        title={isEditMode ? t('events.pools.editPool') : t('events.pools.addPool')}
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
          <ManagePoolNameField value={name} onChangeText={setName} />

          {isEditMode && (
            <View style={styles.content}>
              <View style={[styles.totalCard, { backgroundColor: theme.colors.elevation.level2, borderColor: theme.colors.outlineVariant }]}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4, fontWeight: '600', letterSpacing: 0.5 }}>
                  {t('events.pools.totalAccumulated').toUpperCase()}
                </Text>
                <Text 
                  variant="headlineMedium" 
                  style={{ color: theme.colors.primary, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', width: '100%' }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatCurrencyAmount(currencyCode, fromMinorUnits(virtualTotalMinor))}
                </Text>
              </View>

              <ManagePoolContributorsField
                contributions={contributions}
                participants={event?.participants ?? []}
                currencyCode={currencyCode}
                onUpdateAmount={updateContributionAmount}
                onRemove={removeContributor}
                onAdd={handleAddContributor}
              />
            </View>
          )}
        </ScrollView>

        <BottomActionBar
          onSave={handleSave}
          disabled={isSaveDisabled}
          bottomInset={insets.bottom}
          label={t('common.save')}
          secondaryLabel={isEditMode ? t('common.delete') : undefined}
          onSecondaryPress={isEditMode ? openDeleteConfirm : undefined}
        />
      </KeyboardAvoidingView>

      <AppMessageSnackbar message={errorMessage} visible={isErrorVisible} onDismiss={clearErrorMessage} />

      <AppDeleteConfirm
        visible={isDeleteConfirmVisible}
        title={t('events.pools.deletePool.title')}
        message={t('events.pools.deletePool.message')}
        onDismiss={closeDeleteConfirm}
        onConfirm={handleDelete}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: {
    marginTop: 24,
  },
  totalCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.soft,
  },
});

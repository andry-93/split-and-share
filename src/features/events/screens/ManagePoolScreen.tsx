import React, { useCallback, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { EventsStackParamList } from '@/navigation/types';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { AppHeader } from '@/shared/ui/AppHeader';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useMessageState } from '@/shared/hooks/useMessageState';
import { useManagePoolForm } from '@/features/events/hooks/useManagePoolForm';
import { addExpenseStyles as featureStyles } from '@/features/events/components/add-expense/styles';
import { ManagePoolNameField } from '@/features/events/components/manage-pool/ManagePoolNameField';
import { BottomActionBar } from '@/features/events/components/add-expense/BottomActionBar';
import { AppDeleteConfirm } from '@/shared/ui/AppDeleteConfirm';
import { AppMessageSnackbar } from '@/shared/ui/AppMessageSnackbar';

type ManagePoolScreenProps = NativeStackScreenProps<EventsStackParamList, 'ManagePool'>;

export function ManagePoolScreen({ navigation, route }: ManagePoolScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { events } = useEventsState();
  const { addPool, updatePool, removePool } = useEventsActions();

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

  const { name, setName, isSaveDisabled } = useManagePoolForm({
    initialName: editingPool?.name ?? '',
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
        updatePool({ eventId, poolId, name });
      } else {
        addPool({ eventId, name });
      }
      navigation.goBack();
    } catch (error) {
      setErrorMessage(t('common.error'));
    }
  }, [isEditMode, poolId, eventId, name, addPool, updatePool, navigation, t, setErrorMessage]);

  const handleDelete = useCallback(() => {
    if (poolId) {
      removePool({ eventId, poolIds: [poolId] });
      navigation.goBack();
    }
  }, [eventId, poolId, removePool, navigation]);


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
});

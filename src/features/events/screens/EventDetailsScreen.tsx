import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsActions, useEventsState } from '../../../state/events/eventsContext';
import { RawDebt, SimplifiedDebt } from '../../../state/events/eventsSelectors';
import { useSettingsState } from '../../../state/settings/settingsContext';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { DraggableFab } from '../../../shared/ui/DraggableFab';
import { useEventDetailsModel } from '../hooks/useEventDetailsModel';
import { DebtsPanel } from '../components/event-details/DebtsPanel';
import { ExpensesPanel, ExpensesSelectionToolbarState } from '../components/event-details/ExpensesPanel';
import { PeoplePanel, PeopleSelectionToolbarState } from '../components/event-details/PeoplePanel';
import { Summary } from '../components/event-details/Summary';
import { EventDetailsTab, TopTabs } from '../components/event-details/TopTabs';
import { eventDetailsStyles as styles } from '../components/event-details/styles';
import { SelectionActionToolbar } from '../../../shared/ui/SelectionActionToolbar';

type EventDetailsScreenProps = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

const DEBTS_LIST_BOTTOM_GAP = 12;

export function EventDetailsScreen({ navigation, route }: EventDetailsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events, paymentsByEvent } = useEventsState();
  const { registerPayment, removeParticipantsFromEvent, removeExpenses } = useEventsActions();
  const event = events.find((item) => item.id === route.params.eventId);
  const [activeTab, setActiveTab] = useState<EventDetailsTab>('expenses');
  const [debtsMode, setDebtsMode] = useState<'detailed' | 'simplified'>('detailed');
  const [rawViewportHeight, setRawViewportHeight] = useState(0);
  const [rawContentHeight, setRawContentHeight] = useState(0);
  const [debtHintHeight, setDebtHintHeight] = useState(0);
  const [peopleToolbarState, setPeopleToolbarState] = useState<PeopleSelectionToolbarState | null>(null);
  const [expensesToolbarState, setExpensesToolbarState] = useState<ExpensesSelectionToolbarState | null>(null);

  const handleViewDetailedDebts = useCallback(() => {
    setDebtsMode('detailed');
  }, []);

  useEffect(() => {
    if (activeTab !== 'people') {
      setPeopleToolbarState(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'expenses') {
      setExpensesToolbarState(null);
    }
  }, [activeTab]);

  if (!event) {
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <AppHeader title="Event Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.missingState}>
          <Text variant="titleMedium">Event not found</Text>
          <Text variant="bodyMedium">Please go back and choose another event.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    currencyCode,
    detailedDebts,
    simplifiedDebts,
    baseDetailedCount,
    baseSimplifiedCount,
    paidDetailedCount,
    paidSimplifiedCount,
    participantBalanceMap,
    totalAmountDisplay,
    participantsCount,
    expensesCount,
  } = useEventDetailsModel({
    event,
    eventsState: { events, paymentsByEvent },
    settingsCurrency: settings.currency,
  });

  const handleMarkSimplifiedPaid = useCallback(
    (debt: SimplifiedDebt, amount: number) => {
      registerPayment({
        eventId: event.id,
        fromId: debt.from.id,
        toId: debt.to.id,
        amount,
        source: 'simplified',
      });
    },
    [event.id, registerPayment],
  );

  const handleMarkDetailedPaid = useCallback(
    (debt: RawDebt, amount: number) => {
      registerPayment({
        eventId: event.id,
        fromId: debt.from.id,
        toId: debt.to.id,
        amount,
        source: 'detailed',
      });
    },
    [event.id, registerPayment],
  );

  const handleAddExpense = useCallback(() => {
    navigation.navigate('AddExpense', { eventId: event.id });
  }, [event.id, navigation]);

  const handleOpenExpense = useCallback(
    (expenseId: string) => {
      navigation.navigate('AddExpense', { eventId: event.id, expenseId });
    },
    [event.id, navigation],
  );

  const handleAddPeople = useCallback(() => {
    navigation.navigate('AddPeopleToEvent', { eventId: event.id });
  }, [event.id, navigation]);

  const handleEditEvent = useCallback(() => {
    navigation.navigate('AddEvent', { eventId: event.id });
  }, [event.id, navigation]);

  const handleRemoveExpenses = useCallback(
    (expenseIds: string[]) => {
      removeExpenses({
        eventId: event.id,
        expenseIds,
      });
    },
    [event.id, removeExpenses],
  );

  const handleRemoveParticipants = useCallback(
    (participantIds: string[]) => {
      removeParticipantsFromEvent({
        eventId: event.id,
        participantIds,
      });
    },
    [event.id, removeParticipantsFromEvent],
  );

  const handleRawViewportLayout = useCallback((layoutEvent: LayoutChangeEvent) => {
    setRawViewportHeight(layoutEvent.nativeEvent.layout.height);
  }, []);

  const rawContainerHeight = useMemo(() => {
    if (rawViewportHeight <= 0) {
      return undefined;
    }
    const maxHeight = Math.max(
      0,
      rawViewportHeight - debtHintHeight - DEBTS_LIST_BOTTOM_GAP - Math.max(insets.bottom, 0),
    );
    const nextHeight = rawContentHeight > 0 ? Math.min(rawContentHeight, maxHeight) : maxHeight;
    return Math.max(1, nextHeight);
  }, [debtHintHeight, insets.bottom, rawContentHeight, rawViewportHeight]);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {activeTab === 'people' && peopleToolbarState?.visible ? (
        <SelectionActionToolbar
          title={peopleToolbarState.title}
          totalSelectableCount={peopleToolbarState.totalSelectableCount}
          selectedCount={peopleToolbarState.selectedCount}
          onToggleSelectAll={peopleToolbarState.onToggleSelectAll}
          onDelete={peopleToolbarState.onDelete}
          onClose={peopleToolbarState.onClose}
        />
      ) : activeTab === 'expenses' && expensesToolbarState?.visible ? (
        <SelectionActionToolbar
          title={expensesToolbarState.title}
          totalSelectableCount={expensesToolbarState.totalSelectableCount}
          selectedCount={expensesToolbarState.selectedCount}
          onToggleSelectAll={expensesToolbarState.onToggleSelectAll}
          onDelete={expensesToolbarState.onDelete}
          onClose={expensesToolbarState.onClose}
        />
      ) : (
        <AppHeader
          title={event.name}
          onBackPress={() => navigation.goBack()}
          rightSlot={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Appbar.Action icon="pencil-outline" onPress={handleEditEvent} />
              <Appbar.Action icon="share-variant" onPress={() => undefined} />
            </View>
          }
        />
      )}

      <View style={styles.topSection}>
        <Summary
          totalAmountDisplay={totalAmountDisplay}
          participantsCount={participantsCount}
          expensesCount={expensesCount}
        />
        <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      <View style={styles.contentArea}>
        {activeTab === 'expenses' ? (
          <ExpensesPanel
            expenses={event.expenses}
            currencyCode={currencyCode}
            onRemoveExpenses={handleRemoveExpenses}
            onOpenExpense={handleOpenExpense}
            onSelectionToolbarChange={setExpensesToolbarState}
          />
        ) : null}

        {activeTab === 'debts' ? (
          <DebtsPanel
            mode={debtsMode}
            onModeChange={setDebtsMode}
            onViewDetailedDebts={handleViewDetailedDebts}
            detailedDebts={detailedDebts}
            simplifiedDebts={simplifiedDebts}
            baseDetailedCount={baseDetailedCount}
            paidDetailedCount={paidDetailedCount}
            baseSimplifiedCount={baseSimplifiedCount}
            paidSimplifiedCount={paidSimplifiedCount}
            currencyCode={currencyCode}
            onMarkDetailedPaid={handleMarkDetailedPaid}
            onMarkSimplifiedPaid={handleMarkSimplifiedPaid}
            rawContainerHeight={rawContainerHeight}
            onViewportLayout={handleRawViewportLayout}
            onHintLayout={setDebtHintHeight}
            onContentSizeChange={(_, height) => setRawContentHeight(height)}
          />
        ) : null}

        {activeTab === 'people' ? (
          <PeoplePanel
            participants={event.participants}
            participantBalanceMap={participantBalanceMap}
            currencyCode={currencyCode}
            onRemoveParticipants={handleRemoveParticipants}
            onSelectionToolbarChange={setPeopleToolbarState}
          />
        ) : null}
      </View>

      {activeTab === 'expenses' && !expensesToolbarState?.visible ? (
        <DraggableFab
          icon="plus"
          color="#FFFFFF"
          backgroundColor="#2563FF"
          onPress={handleAddExpense}
          topBoundary={220}
        />
      ) : null}

      {activeTab === 'people' && !peopleToolbarState?.visible ? (
        <DraggableFab
          icon="plus"
          color="#FFFFFF"
          backgroundColor="#2563FF"
          onPress={handleAddPeople}
          topBoundary={220}
        />
      ) : null}
    </SafeAreaView>
  );
}

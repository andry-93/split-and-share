import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '@/navigation/types';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { RawDebt, selectExpensesSortedByUpdatedAt, SimplifiedDebt } from '@/state/events/eventsSelectors';
import { useSettingsState } from '@/state/settings/settingsContext';
import { AppHeader } from '@/shared/ui/AppHeader';
import { DraggableFab } from '@/shared/ui/DraggableFab';
import { useEventDetailsModel } from '@/features/events/hooks/useEventDetailsModel';
import { DebtsPanel } from '@/features/events/components/event-details/DebtsPanel';
import { ExpensesPanel, ExpensesSelectionToolbarState } from '@/features/events/components/event-details/ExpensesPanel';
import { PeoplePanel, PeopleSelectionToolbarState } from '@/features/events/components/event-details/PeoplePanel';
import { Summary } from '@/features/events/components/event-details/Summary';
import { EventDetailsTab, TopTabs } from '@/features/events/components/event-details/TopTabs';
import { eventDetailsStyles as styles } from '@/features/events/components/event-details/styles';
import { SelectionActionToolbar } from '@/shared/ui/SelectionActionToolbar';

type EventDetailsScreenProps = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

const DEBTS_LIST_BOTTOM_GAP = 12;
const TAB_ORDER: EventDetailsTab[] = ['expenses', 'debts', 'people'];
const HORIZONTAL_THRESHOLD = 64;
const VELOCITY_THRESHOLD = 420;

function getNextTabFromSwipe(
  activeIndex: number,
  translationX: number,
  velocityX: number,
): EventDetailsTab | null {
  'worklet';
  const shouldGoNext = translationX < -HORIZONTAL_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;
  const shouldGoPrev = translationX > HORIZONTAL_THRESHOLD || velocityX > VELOCITY_THRESHOLD;

  if (shouldGoNext && activeIndex < TAB_ORDER.length - 1) {
    return TAB_ORDER[activeIndex + 1];
  }

  if (shouldGoPrev && activeIndex > 0) {
    return TAB_ORDER[activeIndex - 1];
  }

  return null;
}

export function EventDetailsScreen({ navigation, route }: EventDetailsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events, groups, paymentsByEvent } = useEventsState();
  const { registerPayment, removeParticipantsFromEvent, removeExpenses } = useEventsActions();
  const event = events.find((item) => item.id === route.params.eventId);
  const [activeTab, setActiveTab] = useState<EventDetailsTab>('expenses');
  const [rawViewportHeight, setRawViewportHeight] = useState(0);
  const [rawContentHeight, setRawContentHeight] = useState(0);
  const [debtHintHeight, setDebtHintHeight] = useState(0);
  const [peopleToolbarState, setPeopleToolbarState] = useState<PeopleSelectionToolbarState | null>(null);
  const [expensesToolbarState, setExpensesToolbarState] = useState<ExpensesSelectionToolbarState | null>(null);
  const activeTabIndex = TAB_ORDER.indexOf(activeTab);
  const activeSelectionToolbarState =
    activeTab === 'people' ? peopleToolbarState : activeTab === 'expenses' ? expensesToolbarState : null;
  const showSelectionToolbar = Boolean(activeSelectionToolbarState?.visible);

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
    eventsState: { events, groups, paymentsByEvent },
    settingsCurrency: settings.currency,
  });
  const debtsMode = settings.debtsViewMode;

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
  const shouldShowFab = useMemo(() => {
    if (activeTab === 'expenses') {
      return !expensesToolbarState?.visible;
    }
    if (activeTab === 'people') {
      return !peopleToolbarState?.visible;
    }
    return false;
  }, [activeTab, expensesToolbarState?.visible, peopleToolbarState?.visible]);
  const handleFabPress = useCallback(() => {
    if (activeTab === 'expenses') {
      handleAddExpense();
      return;
    }
    if (activeTab === 'people') {
      handleAddPeople();
    }
  }, [activeTab, handleAddExpense, handleAddPeople]);

  const handleEditEvent = useCallback(() => {
    navigation.navigate('AddEvent', { eventId: event.id });
  }, [event.id, navigation]);

  const handleShareEvent = useCallback(() => {
    navigation.navigate('EventReportPreview', { eventId: event.id });
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

  const sortedExpenses = useMemo(
    () => selectExpensesSortedByUpdatedAt(event.expenses),
    [event.expenses],
  );

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

  const isTopTabsSwipeEnabled = useMemo(() => !showSelectionToolbar, [showSelectionToolbar]);

  const tabsSwipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isTopTabsSwipeEnabled && activeTabIndex >= 0)
        .activeOffsetX([-24, 24])
        .failOffsetY([-14, 14])
        .onEnd((event) => {
          const nextTab = getNextTabFromSwipe(activeTabIndex, event.translationX, event.velocityX);
          if (nextTab) {
            runOnJS(setActiveTab)(nextTab);
          }
        }),
    [activeTabIndex, isTopTabsSwipeEnabled],
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {showSelectionToolbar ? (
        <SelectionActionToolbar
          title={activeSelectionToolbarState!.title}
          totalSelectableCount={activeSelectionToolbarState!.totalSelectableCount}
          selectedCount={activeSelectionToolbarState!.selectedCount}
          onToggleSelectAll={activeSelectionToolbarState!.onToggleSelectAll}
          onDelete={activeSelectionToolbarState!.onDelete}
          onClose={activeSelectionToolbarState!.onClose}
        />
      ) : (
        <AppHeader
          title={event.name}
          onBackPress={() => navigation.goBack()}
          rightSlot={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Appbar.Action icon="pencil-outline" onPress={handleEditEvent} />
              <Appbar.Action icon="share-variant" onPress={handleShareEvent} />
            </View>
          }
        />
      )}

      <GestureDetector gesture={tabsSwipeGesture}>
        <View style={styles.contentArea}>
          <View style={styles.topSection}>
            <Summary
              totalAmountDisplay={totalAmountDisplay}
              participantsCount={participantsCount}
              expensesCount={expensesCount}
            />
            <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </View>

          <View style={styles.tabPanelArea}>
            {activeTab === 'expenses' ? (
              <ExpensesPanel
                expenses={sortedExpenses}
                currencyCode={currencyCode}
                onRemoveExpenses={handleRemoveExpenses}
                onOpenExpense={handleOpenExpense}
                onSelectionToolbarChange={setExpensesToolbarState}
              />
            ) : null}

            {activeTab === 'debts' ? (
              <DebtsPanel
                mode={debtsMode}
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
        </View>
      </GestureDetector>

      <DraggableFab
        icon="plus"
        color="#FFFFFF"
        backgroundColor="#2563FF"
        onPress={handleFabPress}
        topBoundary={220}
        visible={shouldShowFab}
      />
    </SafeAreaView>
  );
}

import React, { useCallback, useMemo, useState } from 'react';
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
import { ExpensesPanel } from '../components/event-details/ExpensesPanel';
import { PeoplePanel } from '../components/event-details/PeoplePanel';
import { Summary } from '../components/event-details/Summary';
import { EventDetailsTab, TopTabs } from '../components/event-details/TopTabs';
import { eventDetailsStyles as styles } from '../components/event-details/styles';

type EventDetailsScreenProps = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

const DEBTS_LIST_BOTTOM_GAP = 12;

export function EventDetailsScreen({ navigation, route }: EventDetailsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events, paymentsByEvent } = useEventsState();
  const { registerPayment } = useEventsActions();
  const event = events.find((item) => item.id === route.params.eventId);
  const [activeTab, setActiveTab] = useState<EventDetailsTab>('expenses');
  const [debtsMode, setDebtsMode] = useState<'detailed' | 'simplified'>('detailed');
  const [rawViewportHeight, setRawViewportHeight] = useState(0);
  const [rawContentHeight, setRawContentHeight] = useState(0);
  const [debtHintHeight, setDebtHintHeight] = useState(0);

  const handleViewDetailedDebts = useCallback(() => {
    setDebtsMode('detailed');
  }, []);

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

  const handleAddPeople = useCallback(() => {
    navigation.navigate('AddPeopleToEvent', { eventId: event.id });
  }, [event.id, navigation]);

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
      <AppHeader
        title={event.name}
        onBackPress={() => navigation.goBack()}
        rightSlot={<Appbar.Action icon="share-variant" onPress={() => undefined} />}
      />

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
          <ExpensesPanel expenses={event.expenses} currencyCode={currencyCode} />
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
          />
        ) : null}
      </View>

      {activeTab === 'expenses' ? (
        <DraggableFab
          icon="plus"
          color="#FFFFFF"
          backgroundColor="#2563FF"
          onPress={handleAddExpense}
          topBoundary={220}
        />
      ) : null}

      {activeTab === 'people' ? (
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

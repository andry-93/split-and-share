import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Button, Card, FAB, Icon, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { ExpenseItem, ParticipantItem } from '../types/events';
import { useEventsActions, useEventsState } from '../../../state/events/eventsContext';
import {
  RawDebt,
  SimplifiedDebt,
  selectPaidSimplifiedIds,
  selectRawDebts,
  selectSimplifiedDebts,
  selectSimplifiedTotals,
  selectTotalAmount,
  selectParticipantsCount,
  selectExpensesCount,
} from '../../../state/events/eventsSelectors';

type EventDetailsScreenProps = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

type SummaryMetricProps = {
  label: string;
  value: string;
};

export function EventDetailsScreen({ navigation, route }: EventDetailsScreenProps) {
  const theme = useTheme();
  const { events, paidSimplifiedByEvent } = useEventsState();
  const { markSimplifiedPaid } = useEventsActions();
  const event = events.find((item) => item.id === route.params.eventId);
  const [activeTab, setActiveTab] = useState<'expenses' | 'debts' | 'people'>('expenses');
  const [debtsMode, setDebtsMode] = useState<'raw' | 'simplified'>('raw');

  const handleTabChange = useCallback((value: string) => {
    if (value === 'expenses' || value === 'debts' || value === 'people') {
      setActiveTab(value);
    }
  }, []);

  const handleDebtsModeChange = useCallback((value: string) => {
    if (value === 'raw' || value === 'simplified') {
      setDebtsMode(value);
    }
  }, []);

  const handleViewRawDebts = useCallback(() => {
    setDebtsMode('raw');
  }, []);

  const totalAmount = useMemo(() => selectTotalAmount(event), [event]);
  const participantsCount = useMemo(() => selectParticipantsCount(event), [event]);
  const expensesCount = useMemo(() => selectExpensesCount(event), [event]);

  if (!event) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Event Details" />
        </Appbar.Header>
        <View style={styles.missingState}>
          <Text variant="titleMedium">Event not found</Text>
          <Text variant="bodyMedium">Please go back and choose another event.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rawDebts = useMemo(() => selectRawDebts(event), [event]);
  const simplifiedDebts = useMemo(() => selectSimplifiedDebts(rawDebts), [rawDebts]);

  const simplifiedTotals = useMemo(() => selectSimplifiedTotals(simplifiedDebts), [simplifiedDebts]);

  const paidSimplifiedIds = selectPaidSimplifiedIds({ events, paidSimplifiedByEvent }, event.id);
  const paidSet = useMemo(() => new Set(paidSimplifiedIds), [paidSimplifiedIds]);
  const visibleSimplifiedDebts = useMemo(
    () => simplifiedDebts.filter((debt) => !paidSet.has(debt.id)),
    [paidSet, simplifiedDebts],
  );

  const header = useMemo(
    () => (
      <View>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <SummaryMetric label="Total spent" value={`${totalAmount}`} />
            <SummaryMetric label="Participants" value={`${participantsCount}`} />
            <SummaryMetric label="Expenses" value={`${expensesCount}`} />
          </Card.Content>
        </Card>

        <SegmentedButtons
          value={activeTab}
          onValueChange={handleTabChange}
          style={styles.tabs}
          buttons={[
            { value: 'expenses', label: 'Expenses' },
            { value: 'debts', label: 'Debts' },
            { value: 'people', label: 'People' },
          ]}
        />
      </View>
    ),
    [activeTab, handleTabChange, participantsCount, expensesCount, totalAmount],
  );

  const handleMarkPaid = useCallback(
    (id: string) => {
      markSimplifiedPaid({ eventId: event.id, debtId: id });
    },
    [event.id, markSimplifiedPaid],
  );

  const renderExpenseItem = useCallback(
    ({ item }: { item: ExpenseItem }) => <ExpenseCard expense={item} />,
    [],
  );

  const renderParticipantItem = useCallback(
    ({ item }: { item: ParticipantItem }) => <ParticipantRow participant={item} />,
    [],
  );

  const renderDebtItem = useCallback(
    ({ item }: { item: RawDebt | SimplifiedDebt }) =>
      debtsMode === 'raw' ? (
        <DebtRow debt={item as RawDebt} />
      ) : (
        <SimplifiedDebtRow debt={item as SimplifiedDebt} onMarkPaid={handleMarkPaid} />
      ),
    [debtsMode, handleMarkPaid],
  );

  const renderDebtHeader = useMemo(
    () => (
      <View>
        {header}
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <SummaryMetric label="You owe" value={debtsMode === 'raw' ? '0' : `${simplifiedTotals.youOwe}`} />
            <SummaryMetric label="You are owed" value={debtsMode === 'raw' ? '0' : `${simplifiedTotals.youAreOwed}`} />
          </Card.Content>
        </Card>
        <SegmentedButtons
          value={debtsMode}
          onValueChange={handleDebtsModeChange}
          style={styles.tabs}
          buttons={[
            { value: 'raw', label: 'Raw' },
            { value: 'simplified', label: 'Simplified' },
          ]}
        />
      </View>
    ),
    [debtsMode, handleDebtsModeChange, header, simplifiedTotals.youAreOwed, simplifiedTotals.youOwe],
  );

  const handleAddExpense = useCallback(() => {
    navigation.navigate('AddExpense', { eventId: event.id });
  }, [event.id, navigation]);

  const handleAddPeople = useCallback(() => {
    navigation.navigate('AddPeopleToEvent', { eventId: event.id });
  }, [event.id, navigation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={event.name} />
        <Appbar.Action icon="share-variant" onPress={() => undefined} />
      </Appbar.Header>

      {activeTab === 'expenses' ? (
        <FlatList
          data={event.expenses}
          keyExtractor={(item) => item.id}
          style={styles.list}
          removeClippedSubviews
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          contentContainerStyle={[
            styles.listContent,
            event.expenses.length === 0 ? styles.listEmpty : null,
          ]}
          ListHeaderComponent={header}
          renderItem={renderExpenseItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleMedium">No expenses yet</Text>
              <Text variant="bodyMedium">Add expenses to see who owes whom.</Text>
            </View>
          }
        />
      ) : activeTab === 'debts' ? (
        <FlatList
          data={debtsMode === 'raw' ? rawDebts : visibleSimplifiedDebts}
          keyExtractor={(item) => item.id}
          style={styles.list}
          removeClippedSubviews
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          contentContainerStyle={[
            styles.listContent,
            (debtsMode === 'raw'
              ? rawDebts.length === 0
              : visibleSimplifiedDebts.length === 0)
              ? styles.listEmpty
              : null,
          ]}
          ListHeaderComponent={renderDebtHeader}
          renderItem={renderDebtItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {debtsMode === 'raw' ? (
                <>
                  <Text variant="titleMedium">No debts yet</Text>
                  <Text variant="bodyMedium">Add expenses to see who owes whom.</Text>
                </>
              ) : (
                <View style={styles.allSettled}>
                  <Icon source="check-circle" size={40} color={theme.colors.onSurfaceVariant} />
                  <Text variant="titleMedium">All settled</Text>
                  <Text variant="bodyMedium">Everyone is square.</Text>
                  <Button mode="text" onPress={handleViewRawDebts}>
                    View raw debts
                  </Button>
                </View>
              )}
            </View>
          }
        />
      ) : (
        <FlatList
          data={event.participants}
          keyExtractor={(item) => item.id}
          style={styles.list}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          contentContainerStyle={[
            styles.listContent,
            event.participants.length === 0 ? styles.listEmpty : null,
          ]}
          ListHeaderComponent={header}
          renderItem={renderParticipantItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleMedium">No people in this event</Text>
              <Text variant="bodyMedium">Add people to start splitting expenses.</Text>
            </View>
          }
        />
      )}

      {activeTab === 'expenses' ? (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddExpense}
        />
      ) : activeTab === 'people' ? (
        <FAB icon="plus" style={styles.fab} onPress={handleAddPeople} />
      ) : null}
    </SafeAreaView>
  );
}

const SummaryMetric = memo(function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <View style={styles.metric}>
      <Text variant="labelMedium">{label}</Text>
      <Text variant="titleMedium">{value}</Text>
    </View>
  );
});

type ExpenseCardProps = {
  expense: ExpenseItem;
};

const ExpenseCard = memo(function ExpenseCard({ expense }: ExpenseCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text variant="titleMedium">{expense.title}</Text>
          <Text variant="bodyMedium">Paid by {expense.paidBy}</Text>
        </View>
        <Text variant="titleMedium" style={styles.amount}>
          {expense.amount}
        </Text>
      </Card.Content>
    </Card>
  );
});

type ParticipantRowProps = {
  participant: ParticipantItem;
};

const ParticipantRow = memo(function ParticipantRow({ participant }: ParticipantRowProps) {
  const initials = participant.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <View style={styles.participantRow}>
      <Avatar.Text size={40} label={initials || '?'} style={styles.avatar} />
      <View style={styles.participantText}>
        <Text variant="titleMedium">{participant.name}</Text>
        <Text variant="bodyMedium">Balance: 0</Text>
      </View>
    </View>
  );
});

type DebtRowProps = {
  debt: RawDebt;
};

const DebtRow = memo(function DebtRow({ debt }: DebtRowProps) {
  const fromInitials = debt.from.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.debtRow}>
          <Avatar.Text size={36} label={fromInitials || '?'} style={styles.avatar} />
          <View style={styles.debtText}>
            <Text variant="titleMedium">{debt.from.name}</Text>
            <Text variant="bodyMedium">owes {debt.to.name}</Text>
          </View>
        </View>
        <Text variant="titleMedium" style={styles.amount}>
          {debt.amount}
        </Text>
      </Card.Content>
    </Card>
  );
});

type SimplifiedDebtRowProps = {
  debt: SimplifiedDebt;
  onMarkPaid: (id: string) => void;
};

const SimplifiedDebtRow = memo(function SimplifiedDebtRow({ debt, onMarkPaid }: SimplifiedDebtRowProps) {
  const fromInitials = debt.from.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleMarkPaid = useCallback(() => {
    onMarkPaid(debt.id);
  }, [debt.id, onMarkPaid]);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.debtRow}>
          <Avatar.Text size={36} label={fromInitials || '?'} style={styles.avatar} />
          <View style={styles.debtText}>
            <Text variant="titleMedium">{debt.from.name}</Text>
            <Text variant="bodyMedium">pay {debt.to.name}</Text>
          </View>
        </View>
        <Text variant="titleMedium" style={styles.amount}>
          {debt.amount}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.debtActions}>
        <Button mode="text" onPress={handleMarkPaid}>
          Mark as paid
        </Button>
      </Card.Actions>
    </Card>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  listEmpty: {
    flexGrow: 1,
  },
  summaryCard: {
    marginBottom: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  tabs: {
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  amount: {
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  allSettled: {
    alignItems: 'center',
    gap: 8,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    marginRight: 12,
  },
  participantText: {
    flex: 1,
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  debtText: {
    flex: 1,
  },
  debtActions: {
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
});

import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Button, Card, FAB, Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { ExpenseItem, ParticipantItem } from '../types/events';
import { PersonListRow } from '../../people/components/PersonListRow';
import { useEventsActions, useEventsState } from '../../../state/events/eventsContext';
import {
  RawDebt,
  SimplifiedDebt,
  selectPaidSimplifiedIds,
  selectRawDebts,
  selectSimplifiedDebts,
  selectTotalAmount,
  selectParticipantsCount,
  selectExpensesCount,
} from '../../../state/events/eventsSelectors';
import { useSettingsState } from '../../../state/settings/settingsContext';
import { CustomToggleGroup } from '../../../shared/ui/CustomToggleGroup';
import { formatCurrencyAmount, normalizeCurrencyCode } from '../../../shared/utils/currency';

type EventDetailsScreenProps = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

type SummaryMetricProps = {
  label: string;
  value: string;
};

export function EventDetailsScreen({ navigation, route }: EventDetailsScreenProps) {
  const theme = useTheme();
  const settings = useSettingsState();
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

  const handleViewRawDebts = useCallback(() => {
    setDebtsMode('raw');
  }, []);

  const totalAmount = useMemo(() => selectTotalAmount(event), [event]);
  const participantsCount = useMemo(() => selectParticipantsCount(event), [event]);
  const expensesCount = useMemo(() => selectExpensesCount(event), [event]);
  const currencyCode = useMemo(() => normalizeCurrencyCode(settings.currency), [settings.currency]);
  const totalAmountDisplay = useMemo(
    () => formatCurrencyAmount(currencyCode, totalAmount),
    [currencyCode, totalAmount],
  );

  if (!event) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
        <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.outlineVariant }}>
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

  const paidSimplifiedIds = selectPaidSimplifiedIds({ events, paidSimplifiedByEvent }, event.id);
  const paidSet = useMemo(() => new Set(paidSimplifiedIds), [paidSimplifiedIds]);
  const visibleSimplifiedDebts = useMemo(
    () => simplifiedDebts.filter((debt) => !paidSet.has(debt.id)),
    [paidSet, simplifiedDebts],
  );

  const header = useMemo(
    () => (
      <View>
        <Card
          mode="contained"
          style={[
            styles.summaryCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
          ]}
        >
          <Card.Content style={styles.summaryContent}>
            <SummaryMetric label="Total" value={totalAmountDisplay} />
            <SummaryMetric label="People" value={`${participantsCount}`} />
            <SummaryMetric label="Expenses" value={`${expensesCount}`} />
          </Card.Content>
        </Card>

        <View
          style={[
            styles.topTabBar,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outlineVariant,
              borderBottomColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <Pressable
            onPress={() => handleTabChange('expenses')}
            style={[styles.topTabItem, activeTab === 'expenses' ? { borderBottomColor: theme.colors.primary } : null]}
          >
            <Text
              variant="titleMedium"
              style={[styles.topTabLabel, { color: activeTab === 'expenses' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}
            >
              Expenses
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange('debts')}
            style={[styles.topTabItem, activeTab === 'debts' ? { borderBottomColor: theme.colors.primary } : null]}
          >
            <Text
              variant="titleMedium"
              style={[styles.topTabLabel, { color: activeTab === 'debts' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}
            >
              Debts
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange('people')}
            style={[styles.topTabItem, activeTab === 'people' ? { borderBottomColor: theme.colors.primary } : null]}
          >
            <Text
              variant="titleMedium"
              style={[styles.topTabLabel, { color: activeTab === 'people' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}
            >
              People
            </Text>
          </Pressable>
        </View>
      </View>
    ),
    [
      activeTab,
      expensesCount,
      handleTabChange,
      participantsCount,
      theme.colors.onSurfaceVariant,
      theme.colors.outlineVariant,
      theme.colors.primary,
      totalAmountDisplay,
    ],
  );

  const handleMarkPaid = useCallback(
    (id: string) => {
      markSimplifiedPaid({ eventId: event.id, debtId: id });
    },
    [event.id, markSimplifiedPaid],
  );

  const renderExpenseItem = useCallback(
    ({ item }: { item: ExpenseItem }) => <ExpenseCard expense={item} currencyCode={currencyCode} />,
    [currencyCode],
  );

  const participantBalanceMap = useMemo(() => {
    const balanceById = new Map<string, number>();
    event.participants.forEach((participant) => {
      balanceById.set(participant.id, 0);
    });

    rawDebts.forEach((debt) => {
      balanceById.set(debt.from.id, (balanceById.get(debt.from.id) ?? 0) - debt.amount);
      balanceById.set(debt.to.id, (balanceById.get(debt.to.id) ?? 0) + debt.amount);
    });

    return balanceById;
  }, [event.participants, rawDebts]);

  const renderParticipantItem = useCallback(
    ({ item, index }: { item: ParticipantItem; index: number }) => (
      <ParticipantRow
        participant={item}
        balance={participantBalanceMap.get(item.id) ?? 0}
        currencyCode={currencyCode}
        withDivider={index < event.participants.length - 1}
      />
    ),
    [currencyCode, event.participants.length, participantBalanceMap],
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
        <View
          style={[
            styles.debtsModeToggle,
            {
              backgroundColor: 'transparent',
            },
          ]}
        >
          <CustomToggleGroup
            value={debtsMode}
            onChange={(value) => setDebtsMode(value)}
            options={[
              { value: 'raw', label: 'Raw' },
              { value: 'simplified', label: 'Simplified' },
            ]}
            sizeMode="content"
          />
        </View>
      </View>
    ),
    [debtsMode, header],
  );

  const handleAddExpense = useCallback(() => {
    navigation.navigate('AddExpense', { eventId: event.id });
  }, [event.id, navigation]);

  const handleAddPeople = useCallback(() => {
    navigation.navigate('AddPeopleToEvent', { eventId: event.id });
  }, [event.id, navigation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.outlineVariant }}>
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
          style={[styles.fab, styles.fabNoShadow, { backgroundColor: '#2563FF' }]}
          color="#FFFFFF"
          onPress={handleAddExpense}
        />
      ) : activeTab === 'people' ? (
        <FAB
          icon="plus"
          style={[styles.fab, styles.fabNoShadow, { backgroundColor: '#2563FF' }]}
          color="#FFFFFF"
          onPress={handleAddPeople}
        />
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
  currencyCode: string;
};

const ExpenseCard = memo(function ExpenseCard({ expense, currencyCode }: ExpenseCardProps) {
  const theme = useTheme();

  return (
    <Card
      mode="contained"
      style={[styles.card, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.expenseLeading}>
          <View style={[styles.expenseIconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <Icon source="cart-outline" size={18} color={theme.colors.primary} />
          </View>
        </View>
        <View style={styles.cardText}>
          <Text variant="titleMedium">{expense.title}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Paid by {expense.paidBy}
          </Text>
        </View>
        <Text variant="titleMedium" style={styles.amount}>
          {formatCurrencyAmount(currencyCode, expense.amount)}
        </Text>
      </Card.Content>
    </Card>
  );
});

type ParticipantRowProps = {
  participant: ParticipantItem;
  balance: number;
  currencyCode: string;
  withDivider: boolean;
};

const ParticipantRow = memo(function ParticipantRow({
  participant,
  balance,
  currencyCode,
  withDivider,
}: ParticipantRowProps) {
  const theme = useTheme();
  const absoluteBalance = Math.abs(balance);
  const formattedBalance =
    balance > 0
      ? `+${formatCurrencyAmount(currencyCode, absoluteBalance)}`
      : balance < 0
        ? `-${formatCurrencyAmount(currencyCode, absoluteBalance)}`
        : formatCurrencyAmount(currencyCode, 0);

  const balanceStyle = balance > 0
    ? {
        backgroundColor: 'rgba(22, 163, 74, 0.16)',
        borderColor: '#4ADE80',
        color: '#16A34A',
      }
    : balance < 0
      ? {
          backgroundColor: theme.colors.errorContainer,
          borderColor: theme.colors.error,
          color: theme.colors.onErrorContainer,
        }
      : {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          color: theme.colors.onSurfaceVariant,
        };

  const balanceChip = (
    <View style={[styles.balancePill, { backgroundColor: balanceStyle.backgroundColor, borderColor: balanceStyle.borderColor }]}>
      <Text variant="labelMedium" style={{ color: balanceStyle.color }}>
        {formattedBalance}
      </Text>
    </View>
  );

  return (
    <PersonListRow
      name={participant.name}
      contact={participant.contact}
      withDivider={withDivider}
      rightSlot={balanceChip}
    />
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
    marginTop: -12,
    marginHorizontal: -16,
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  topTabBar: {
    marginHorizontal: -16,
    marginBottom: 12,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topTabItem: {
    width: '33.3333%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topTabLabel: {
    fontWeight: '600',
  },
  debtsModeToggle: {
    marginHorizontal: 16,
    marginBottom: 12,
    alignSelf: 'center',
  },
  card: {
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  expenseLeading: {
    marginRight: 10,
  },
  expenseIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  balancePill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  avatar: {
    marginRight: 12,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabNoShadow: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
});

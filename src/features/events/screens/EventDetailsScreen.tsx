import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Appbar, Avatar, Button, Card, FAB, Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { ExpenseItem, ParticipantItem } from '../types/events';
import { PersonListRow } from '../../people/components/PersonListRow';
import { useEventsActions, useEventsState } from '../../../state/events/eventsContext';
import {
  PaymentEntry,
  RawDebt,
  SimplifiedDebt,
  selectDetailedDebts,
  selectEffectiveRawDebts,
  selectExpensesCount,
  selectPayments,
  selectParticipantsCount,
  selectRawDebts,
  selectSimplifiedDebts,
  selectTotalAmount,
} from '../../../state/events/eventsSelectors';
import { useSettingsState } from '../../../state/settings/settingsContext';
import { CustomToggleGroup } from '../../../shared/ui/CustomToggleGroup';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { formatCurrencyAmount, normalizeCurrencyCode } from '../../../shared/utils/currency';

type EventDetailsScreenProps = NativeStackScreenProps<EventsStackParamList, 'EventDetails'>;

type SummaryMetricProps = {
  label: string;
  value: string;
};

type ExpenseCardProps = {
  expense: ExpenseItem;
  currencyCode: string;
};

type ParticipantRowProps = {
  participant: ParticipantItem;
  balance: number;
  currencyCode: string;
  withDivider: boolean;
};

type DebtRowProps = {
  debt: RawDebt;
  currencyCode: string;
  isLast: boolean;
  onMarkPaid: (debt: RawDebt) => void;
};

type SimplifiedDebtRowProps = {
  debt: SimplifiedDebt;
  currencyCode: string;
  isLast: boolean;
  onMarkPaid: (debt: SimplifiedDebt) => void;
};

type DebtProgressHintProps = {
  totalCount: number;
  paidCount: number;
};

const RAW_LIST_BOTTOM_GAP = 12;

function formatRawDebtAmount(currencyCode: string, amount: number) {
  return formatCurrencyAmount(currencyCode, amount);
}

export function EventDetailsScreen({ navigation, route }: EventDetailsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events, paymentsByEvent } = useEventsState();
  const { registerPayment } = useEventsActions();
  const event = events.find((item) => item.id === route.params.eventId);
  const [activeTab, setActiveTab] = useState<'expenses' | 'debts' | 'people'>('expenses');
  const [debtsMode, setDebtsMode] = useState<'detailed' | 'simplified'>('detailed');
  const [rawViewportHeight, setRawViewportHeight] = useState(0);
  const [rawContentHeight, setRawContentHeight] = useState(0);

  const handleTabChange = useCallback((value: string) => {
    if (value === 'expenses' || value === 'debts' || value === 'people') {
      setActiveTab(value);
    }
  }, []);

  const handleViewDetailedDebts = useCallback(() => {
    setDebtsMode('detailed');
  }, []);

  if (!event) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
        <AppHeader title="Event Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.missingState}>
          <Text variant="titleMedium">Event not found</Text>
          <Text variant="bodyMedium">Please go back and choose another event.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const eventCurrency = event.currency;
  const currencyCode = useMemo(
    () => normalizeCurrencyCode(eventCurrency ?? settings.currency),
    [eventCurrency, settings.currency],
  );

  const totalAmount = useMemo(() => selectTotalAmount(event), [event]);
  const participantsCount = useMemo(() => selectParticipantsCount(event), [event]);
  const expensesCount = useMemo(() => selectExpensesCount(event), [event]);
  const totalAmountDisplay = useMemo(
    () => formatCurrencyAmount(currencyCode, totalAmount),
    [currencyCode, totalAmount],
  );

  const rawDebts = useMemo(() => selectRawDebts(event), [event]);
  const payments = useMemo<PaymentEntry[]>(
    () => selectPayments({ events, paymentsByEvent }, event.id),
    [event.id, events, paymentsByEvent],
  );
  const effectiveRawDebts = useMemo(() => selectEffectiveRawDebts(rawDebts, payments), [payments, rawDebts]);
  const detailedDebts = useMemo(() => selectDetailedDebts(effectiveRawDebts), [effectiveRawDebts]);
  const simplifiedDebts = useMemo(() => selectSimplifiedDebts(effectiveRawDebts), [effectiveRawDebts]);

  const baseDetailedCount = useMemo(() => selectDetailedDebts(rawDebts).length, [rawDebts]);
  const baseSimplifiedCount = useMemo(() => selectSimplifiedDebts(rawDebts).length, [rawDebts]);
  const paidDetailedCount = Math.max(0, baseDetailedCount - detailedDebts.length);
  const paidSimplifiedCount = Math.max(0, baseSimplifiedCount - simplifiedDebts.length);

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

  const handleMarkPaid = useCallback(
    (debt: SimplifiedDebt) => {
      registerPayment({
        eventId: event.id,
        fromId: debt.from.id,
        toId: debt.to.id,
        amount: debt.amount,
        source: 'simplified',
      });
    },
    [event.id, registerPayment],
  );
  const handleMarkDetailedPaid = useCallback(
    (debt: RawDebt) => {
      registerPayment({
        eventId: event.id,
        fromId: debt.from.id,
        toId: debt.to.id,
        amount: debt.amount,
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
    const maxHeight = Math.max(0, rawViewportHeight - RAW_LIST_BOTTOM_GAP - Math.max(insets.bottom, 0));
    const nextHeight = rawContentHeight > 0 ? Math.min(rawContentHeight, maxHeight) : maxHeight;
    return Math.max(1, nextHeight);
  }, [insets.bottom, rawContentHeight, rawViewportHeight]);

  const renderExpenseItem = useCallback(
    ({ item }: { item: ExpenseItem }) => <ExpenseCard expense={item} currencyCode={currencyCode} />,
    [currencyCode],
  );

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

  const renderRawDebtItem = useCallback(
    ({ item, index }: { item: RawDebt; index: number }) => (
      <DebtRow
        debt={item}
        currencyCode={currencyCode}
        isLast={index === detailedDebts.length - 1}
        onMarkPaid={handleMarkDetailedPaid}
      />
    ),
    [currencyCode, detailedDebts.length, handleMarkDetailedPaid],
  );

  const renderSimplifiedDebtItem = useCallback(
    ({ item, index }: { item: SimplifiedDebt; index: number }) => (
      <SimplifiedDebtRow
        debt={item}
        currencyCode={currencyCode}
        isLast={index === simplifiedDebts.length - 1}
        onMarkPaid={handleMarkPaid}
      />
    ),
    [currencyCode, handleMarkPaid, simplifiedDebts.length],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <AppHeader
        title={event.name}
        onBackPress={() => navigation.goBack()}
        rightSlot={<Appbar.Action icon="share-variant" onPress={() => undefined} />}
      />

      <View style={styles.topSection}>
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
            <Text variant="titleMedium" style={[styles.topTabLabel, { color: activeTab === 'expenses' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
              Expenses
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange('debts')}
            style={[styles.topTabItem, activeTab === 'debts' ? { borderBottomColor: theme.colors.primary } : null]}
          >
            <Text variant="titleMedium" style={[styles.topTabLabel, { color: activeTab === 'debts' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
              Debts
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange('people')}
            style={[styles.topTabItem, activeTab === 'people' ? { borderBottomColor: theme.colors.primary } : null]}
          >
            <Text variant="titleMedium" style={[styles.topTabLabel, { color: activeTab === 'people' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
              People
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.contentArea}>
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
            renderItem={renderExpenseItem}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text variant="titleMedium">No expenses yet</Text>
                <Text variant="bodyMedium">Add expenses to see who owes whom.</Text>
              </View>
            }
          />
        ) : activeTab === 'debts' ? (
          <View style={styles.debtsContent}>
            <View style={styles.debtsHeaderRow}>
              <Text variant="labelLarge" style={[styles.debtsHeaderLabel, { color: theme.colors.onSurfaceVariant }]}>
                View
              </Text>
              <CustomToggleGroup
                value={debtsMode}
                onChange={(value) => setDebtsMode(value)}
                options={[
                  { value: 'detailed', label: 'Detailed' },
                  { value: 'simplified', label: 'Simplified' },
                ]}
                sizeMode="content"
                variant="chips"
              />
            </View>

            {debtsMode === 'detailed' ? (
              detailedDebts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text variant="titleMedium">No debts yet</Text>
                  <Text variant="bodyMedium">Add expenses to see who owes whom.</Text>
                </View>
              ) : (
                <View style={styles.rawListWrapper} onLayout={handleRawViewportLayout}>
                  <DebtProgressHint totalCount={baseDetailedCount} paidCount={paidDetailedCount} />
                  <View
                    style={[
                      styles.rawListContainer,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outlineVariant,
                        height: rawContainerHeight,
                      },
                    ]}
                  >
                    <FlatList
                      data={detailedDebts}
                      keyExtractor={(item) => item.id}
                      style={styles.rawList}
                      removeClippedSubviews
                      initialNumToRender={10}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                      onContentSizeChange={(_, height) => setRawContentHeight(height)}
                      renderItem={renderRawDebtItem}
                    />
                  </View>
                </View>
              )
            ) : (
              simplifiedDebts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text variant="titleMedium">No debts yet</Text>
                  <Text variant="bodyMedium">Add expenses to see who owes whom.</Text>
                  <Button mode="text" onPress={handleViewDetailedDebts}>
                    View detailed debts
                  </Button>
                </View>
              ) : (
                <View style={styles.rawListWrapper} onLayout={handleRawViewportLayout}>
                  <DebtProgressHint totalCount={baseSimplifiedCount} paidCount={paidSimplifiedCount} />
                  <View
                    style={[
                      styles.rawListContainer,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outlineVariant,
                        height: rawContainerHeight,
                      },
                    ]}
                  >
                    <FlatList
                      data={simplifiedDebts}
                      keyExtractor={(item) => item.id}
                      style={styles.rawList}
                      removeClippedSubviews
                      initialNumToRender={10}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                      onContentSizeChange={(_, height) => setRawContentHeight(height)}
                      renderItem={renderSimplifiedDebtItem}
                    />
                  </View>
                </View>
              )
            )}
          </View>
      ) : (
          event.participants.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="titleMedium">No people in this event</Text>
              <Text variant="bodyMedium">Add people to start splitting expenses.</Text>
            </View>
          ) : (
            <View style={[styles.rawListWrapper, styles.peopleSectionSpacing]}>
              <View
                style={[
                  styles.rawListContainer,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outlineVariant,
                  },
                ]}
              >
                <FlatList
                  data={event.participants}
                  keyExtractor={(item) => item.id}
                  style={styles.rawList}
                  removeClippedSubviews
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  contentContainerStyle={styles.peopleListContent}
                  renderItem={renderParticipantItem}
                />
              </View>
            </View>
          )
        )}
      </View>

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

const DebtProgressHint = memo(function DebtProgressHint({ totalCount, paidCount }: DebtProgressHintProps) {
  const theme = useTheme();
  const isAllPaid = paidCount >= totalCount;

  return (
    <View
      style={[
        styles.simplifiedHint,
        {
          backgroundColor: isAllPaid ? theme.colors.primaryContainer : theme.colors.secondaryContainer,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Text
        variant="labelMedium"
        style={{ color: isAllPaid ? theme.colors.onPrimaryContainer : theme.colors.onSecondaryContainer }}
      >
        {isAllPaid
          ? `All ${totalCount} transfers are marked as paid.`
          : paidCount > 0
            ? `${paidCount} paid, ${totalCount - paidCount} left to mark.`
            : 'Mark transfers as paid when they are completed.'}
      </Text>
    </View>
  );
});

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
            <Icon source="cart-outline" size={20} color={theme.colors.primary} />
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

const DebtRow = memo(function DebtRow({ debt, currencyCode, isLast, onMarkPaid }: DebtRowProps) {
  const theme = useTheme();
  const handleMarkPaid = useCallback(() => {
    onMarkPaid(debt);
  }, [debt, onMarkPaid]);

  return (
    <View>
      <View style={styles.rawDebtRow}>
        <View style={styles.rawDebtText}>
          <Text variant="titleMedium">{debt.from.name}</Text>
          <Text variant="bodyMedium">owes {debt.to.name}</Text>
        </View>
        <View style={styles.simplifiedDebtRight}>
          <Text variant="titleMedium" style={[styles.amount, styles.simplifiedAmount]}>
            {formatRawDebtAmount(currencyCode, debt.amount)}
          </Text>
          <Button
            mode="text"
            onPress={handleMarkPaid}
            compact
            style={styles.markPaidButton}
            contentStyle={styles.markPaidButtonContent}
            labelStyle={[styles.markPaidButtonLabel, { color: theme.colors.primary }]}
          >
            Mark as paid
          </Button>
        </View>
      </View>
      {!isLast ? <View style={[styles.insetDivider, { borderBottomColor: theme.colors.outlineVariant }]} /> : null}
    </View>
  );
});

const SimplifiedDebtRow = memo(function SimplifiedDebtRow({
  debt,
  currencyCode,
  isLast,
  onMarkPaid,
}: SimplifiedDebtRowProps) {
  const theme = useTheme();
  const handleMarkPaid = useCallback(() => {
    onMarkPaid(debt);
  }, [debt, onMarkPaid]);

  return (
    <View>
      <View style={styles.rawDebtRow}>
        <View style={styles.rawDebtText}>
          <Text variant="titleMedium">{debt.from.name}</Text>
          <Text variant="bodyMedium">pays {debt.to.name}</Text>
        </View>
        <View style={styles.simplifiedDebtRight}>
          <Text variant="titleMedium" style={[styles.amount, styles.simplifiedAmount]}>
            {formatRawDebtAmount(currencyCode, debt.amount)}
          </Text>
          <Button
            mode="text"
            onPress={handleMarkPaid}
            compact
            style={styles.markPaidButton}
            contentStyle={styles.markPaidButtonContent}
            labelStyle={[styles.markPaidButtonLabel, { color: theme.colors.primary }]}
          >
            Mark as paid
          </Button>
        </View>
      </View>
      {!isLast ? <View style={[styles.insetDivider, { borderBottomColor: theme.colors.outlineVariant }]} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 16,
  },
  summaryCard: {
    marginTop: 0,
    marginHorizontal: -16,
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
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
    marginBottom: 0,
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
  contentArea: {
    flex: 1,
  },
  debtsContent: {
    flex: 1,
    paddingTop: 12,
  },
  debtsHeaderRow: {
    minHeight: 44,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debtsHeaderLabel: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  peopleListContent: {
    paddingHorizontal: 16,
  },
  peopleSectionSpacing: {
    paddingTop: 12,
  },
  listEmpty: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  expenseLeading: {
    marginRight: 12,
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
  balancePill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rawListWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  simplifiedHint: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  rawListContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rawList: {
    flexGrow: 0,
  },
  rawDebtRow: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rawDebtText: {
    flex: 1,
    marginRight: 12,
  },
  insetDivider: {
    marginHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  simplifiedDebtRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  simplifiedAmount: {
    marginBottom: 4,
  },
  markPaidButton: {
    minHeight: 28,
    marginRight: -10,
  },
  markPaidButtonContent: {
    minHeight: 28,
    paddingHorizontal: 6,
  },
  markPaidButtonLabel: {
    marginVertical: 0,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
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

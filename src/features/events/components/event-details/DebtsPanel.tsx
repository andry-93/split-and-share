import React, { memo, useCallback, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { TextInput as RNTextInput } from 'react-native';
import { RawDebt, SimplifiedDebt } from '@/state/events/eventsSelectors';
import { AppList } from '@/shared/ui/AppList';
import { AppConfirm } from '@/shared/ui/AppConfirm';
import { CustomToggleGroup } from '@/shared/ui/CustomToggleGroup';
import { formatCurrencyAmount, roundMoney } from '@/shared/utils/currency';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { useAutofocusWithRetry } from '@/shared/hooks/useAutofocusWithRetry';
import { eventDetailsStyles as styles } from '@/features/events/components/event-details/styles';

type DebtsPanelProps = {
  mode: 'detailed' | 'simplified';
  onModeChange: (mode: 'detailed' | 'simplified') => void;
  onViewDetailedDebts: () => void;
  detailedDebts: RawDebt[];
  simplifiedDebts: SimplifiedDebt[];
  baseDetailedCount: number;
  paidDetailedCount: number;
  baseSimplifiedCount: number;
  paidSimplifiedCount: number;
  currencyCode: string;
  onMarkDetailedPaid: (debt: RawDebt, amount: number) => void;
  onMarkSimplifiedPaid: (debt: SimplifiedDebt, amount: number) => void;
  rawContainerHeight?: number;
  onViewportLayout: (event: LayoutChangeEvent) => void;
  onHintLayout: (height: number) => void;
  onContentSizeChange: (width: number, height: number) => void;
};

export const DebtsPanel = memo(function DebtsPanel({
  mode,
  onModeChange,
  onViewDetailedDebts,
  detailedDebts,
  simplifiedDebts,
  baseDetailedCount,
  paidDetailedCount,
  baseSimplifiedCount,
  paidSimplifiedCount,
  currencyCode,
  onMarkDetailedPaid,
  onMarkSimplifiedPaid,
  rawContainerHeight,
  onViewportLayout,
  onHintLayout,
  onContentSizeChange,
}: DebtsPanelProps) {
  const theme = useTheme();
  const amountInputRef = useRef<RNTextInput | null>(null);
  const [pendingPayment, setPendingPayment] = useState<
    { mode: 'detailed'; debt: RawDebt } | { mode: 'simplified'; debt: SimplifiedDebt } | null
  >(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const { focusWithRetry: focusAmountInputWithRetry } = useAutofocusWithRetry({
    ref: amountInputRef,
    enabled: Boolean(pendingPayment),
  });

  const openDetailedPaymentConfirm = useCallback((debt: RawDebt) => {
    setPendingPayment({ mode: 'detailed', debt });
    setPaymentAmount(roundMoney(debt.amount).toFixed(2));
    setPaymentError('');
  }, []);

  const openSimplifiedPaymentConfirm = useCallback((debt: SimplifiedDebt) => {
    setPendingPayment({ mode: 'simplified', debt });
    setPaymentAmount(roundMoney(debt.amount).toFixed(2));
    setPaymentError('');
  }, []);

  const closePaymentConfirm = useCallback(() => {
    setPendingPayment(null);
    setPaymentError('');
  }, []);

  const handleConfirmShow = useCallback(() => {
    focusAmountInputWithRetry();
  }, [focusAmountInputWithRetry]);

  const handleConfirmPayment = useCallback(() => {
    if (!pendingPayment) {
      return;
    }

    const parsed = Number(paymentAmount.replace(',', '.').trim());
    const rounded = roundMoney(parsed);
    const maxAmount = roundMoney(pendingPayment.debt.amount);

    if (!Number.isFinite(parsed) || rounded <= 0) {
      setPaymentError('Enter a valid amount.');
      return;
    }

    if (rounded > maxAmount + 0.00001) {
      setPaymentError(`Amount cannot exceed ${formatCurrencyAmount(currencyCode, maxAmount)}.`);
      return;
    }

    if (pendingPayment.mode === 'detailed') {
      onMarkDetailedPaid(pendingPayment.debt, rounded);
    } else {
      onMarkSimplifiedPaid(pendingPayment.debt, rounded);
    }

    closePaymentConfirm();
  }, [
    closePaymentConfirm,
    currencyCode,
    onMarkDetailedPaid,
    onMarkSimplifiedPaid,
    paymentAmount,
    pendingPayment,
  ]);

  const renderRawDebtItem = useCallback(
    ({ item }: { item: RawDebt }) => (
      <DetailedDebtRow debt={item} currencyCode={currencyCode} onMarkPaid={openDetailedPaymentConfirm} />
    ),
    [currencyCode, openDetailedPaymentConfirm],
  );

  const renderSimplifiedDebtItem = useCallback(
    ({ item }: { item: SimplifiedDebt }) => (
      <SimplifiedDebtRow debt={item} currencyCode={currencyCode} onMarkPaid={openSimplifiedPaymentConfirm} />
    ),
    [currencyCode, openSimplifiedPaymentConfirm],
  );

  return (
    <View style={styles.debtsContent}>
      <View style={styles.debtsHeaderRow}>
        <Text variant="labelLarge" style={[styles.debtsHeaderLabel, { color: theme.colors.onSurfaceVariant }]}>
          View
        </Text>
        <CustomToggleGroup
          value={mode}
          onChange={(value) => onModeChange(value)}
          options={[
            { value: 'detailed', label: 'Detailed' },
            { value: 'simplified', label: 'Simplified' },
          ]}
          sizeMode="content"
          variant="chips"
        />
      </View>
      <Text
        variant="bodySmall"
        style={[styles.debtsSharedPaidHint, { color: theme.colors.onSurfaceVariant }]}
      >
        Paid status is shared between Detailed and Simplified.
      </Text>

      {mode === 'detailed' ? (
        detailedDebts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">No debts yet</Text>
            <Text variant="bodyMedium">Add expenses to see who owes whom.</Text>
          </View>
        ) : (
          <DebtsList
            debts={detailedDebts}
            totalCount={baseDetailedCount}
            paidCount={paidDetailedCount}
            rawContainerHeight={rawContainerHeight}
            onViewportLayout={onViewportLayout}
            onHintLayout={onHintLayout}
            onContentSizeChange={onContentSizeChange}
            renderItem={renderRawDebtItem}
          />
        )
      ) : simplifiedDebts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="titleMedium">No debts yet</Text>
          <Text variant="bodyMedium">Add expenses to see who owes whom.</Text>
          <Button mode="text" onPress={onViewDetailedDebts}>
            View detailed debts
          </Button>
        </View>
      ) : (
        <DebtsList
          debts={simplifiedDebts}
          totalCount={baseSimplifiedCount}
          paidCount={paidSimplifiedCount}
          rawContainerHeight={rawContainerHeight}
          onViewportLayout={onViewportLayout}
          onHintLayout={onHintLayout}
          onContentSizeChange={onContentSizeChange}
          renderItem={renderSimplifiedDebtItem}
        />
      )}

      <AppConfirm
        visible={Boolean(pendingPayment)}
        title="Mark as paid"
        onDismiss={closePaymentConfirm}
        onConfirm={handleConfirmPayment}
        onShow={handleConfirmShow}
        confirmText="Save payment"
      >
        {pendingPayment ? (
          <View style={localStyles.sheetContent}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Transfer
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {pendingPayment.debt.from.name} {pendingPayment.mode === 'detailed' ? 'owes' : 'pays'}{' '}
              {pendingPayment.debt.to.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Remaining: {formatCurrencyAmount(currencyCode, pendingPayment.debt.amount)}
            </Text>
            <Text variant="labelLarge" style={localStyles.amountLabel}>
              Amount ({currencyCode})
            </Text>
            <OutlinedFieldContainer style={localStyles.amountFieldContainer}>
              <RNTextInput
                ref={amountInputRef}
                autoFocus
                keyboardType="decimal-pad"
                returnKeyType="done"
                showSoftInputOnFocus
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                style={[
                  localStyles.amountField,
                  localStyles.amountFieldContent,
                  {
                    color: theme.colors.onSurface,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                selectionColor={theme.colors.primary}
              />
            </OutlinedFieldContainer>
            {paymentError ? (
              <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                {paymentError}
              </Text>
            ) : null}
          </View>
        ) : null}
      </AppConfirm>
    </View>
  );
});

type DebtsListProps<T extends { id: string }> = {
  debts: T[];
  totalCount: number;
  paidCount: number;
  rawContainerHeight?: number;
  onViewportLayout: (event: LayoutChangeEvent) => void;
  onHintLayout: (height: number) => void;
  onContentSizeChange: (width: number, height: number) => void;
  renderItem: ({ item }: { item: T }) => React.ReactNode;
};

const DebtsList = memo(function DebtsList<T extends { id: string }>({
  debts,
  totalCount,
  paidCount,
  rawContainerHeight,
  onViewportLayout,
  onHintLayout,
  onContentSizeChange,
  renderItem,
}: DebtsListProps<T>) {
  return (
    <View style={styles.debtsListWrapper} onLayout={onViewportLayout}>
      <DebtProgressHint totalCount={totalCount} paidCount={paidCount} onLayout={onHintLayout} />
      <View style={[styles.rawListContainerHeight, { height: rawContainerHeight }]}>
        <AppList
          data={debts}
          keyExtractor={(item) => item.id}
          containerStyle={styles.rawListContainer}
          listStyle={styles.rawList}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          onContentSizeChange={onContentSizeChange}
          renderItem={({ item }) => renderItem({ item })}
        />
      </View>
    </View>
  );
}) as <T extends { id: string }>(props: DebtsListProps<T>) => React.JSX.Element;

type DebtProgressHintProps = {
  totalCount: number;
  paidCount: number;
  onLayout?: (height: number) => void;
};

const DebtProgressHint = memo(function DebtProgressHint({
  totalCount,
  paidCount,
  onLayout,
}: DebtProgressHintProps) {
  const theme = useTheme();
  const isAllPaid = paidCount >= totalCount;

  return (
    <View
      onLayout={
        onLayout
          ? (event) => {
              onLayout(event.nativeEvent.layout.height);
            }
          : undefined
      }
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

type DetailedDebtRowProps = {
  debt: RawDebt;
  currencyCode: string;
  onMarkPaid: (debt: RawDebt) => void;
};

const DetailedDebtRow = memo(function DetailedDebtRow({
  debt,
  currencyCode,
  onMarkPaid,
}: DetailedDebtRowProps) {
  const theme = useTheme();
  const handleMarkPaid = useCallback(() => {
    onMarkPaid(debt);
  }, [debt, onMarkPaid]);

  return (
    <View style={styles.rawDebtRow}>
      <View style={styles.rawDebtText}>
        <Text variant="titleMedium">{debt.from.name}</Text>
        <Text variant="bodyMedium">owes {debt.to.name}</Text>
      </View>
      <View style={styles.simplifiedDebtRight}>
        <Text variant="titleMedium" style={[styles.amount, styles.simplifiedAmount]}>
          {formatCurrencyAmount(currencyCode, debt.amount)}
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
  );
});

type SimplifiedDebtRowProps = {
  debt: SimplifiedDebt;
  currencyCode: string;
  onMarkPaid: (debt: SimplifiedDebt) => void;
};

const SimplifiedDebtRow = memo(function SimplifiedDebtRow({
  debt,
  currencyCode,
  onMarkPaid,
}: SimplifiedDebtRowProps) {
  const theme = useTheme();
  const handleMarkPaid = useCallback(() => {
    onMarkPaid(debt);
  }, [debt, onMarkPaid]);

  return (
    <View style={styles.rawDebtRow}>
      <View style={styles.rawDebtText}>
        <Text variant="titleMedium">{debt.from.name}</Text>
        <Text variant="bodyMedium">pays {debt.to.name}</Text>
      </View>
      <View style={styles.simplifiedDebtRight}>
        <Text variant="titleMedium" style={[styles.amount, styles.simplifiedAmount]}>
          {formatCurrencyAmount(currencyCode, debt.amount)}
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
  );
});

const localStyles = StyleSheet.create({
  sheetContent: {
    gap: 8,
    paddingBottom: 4,
  },
  amountLabel: {
    marginTop: 4,
  },
  amountFieldContainer: {
    minHeight: 56,
    justifyContent: 'center',
  },
  amountField: {
    height: 52,
    backgroundColor: 'transparent',
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  amountFieldContent: {
    paddingHorizontal: 12,
  },
});

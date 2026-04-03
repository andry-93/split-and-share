import React, { memo, useCallback, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { TextInput as RNTextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RawDebt, SimplifiedDebt } from '@/state/events/eventsSelectors';
import { AppList } from '@/shared/ui/AppList';
import { AppConfirm } from '@/shared/ui/AppConfirm';
import {
  formatCurrencyAmount,
  parseMoneyAmount,
} from '@/shared/utils/money';
import { formatMoneyInputValue, getAmountInputPlaceholder } from '@/shared/utils/numberFormat';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { useAutofocusWithRetry } from '@/shared/hooks/useAutofocusWithRetry';
import { eventDetailsStyles as styles } from '@/features/events/components/event-details/styles';
import { validatePaymentAmount } from '@/domain/finance/invariants';

type DebtsPanelProps = {
  mode: 'detailed' | 'simplified';
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
  const { t } = useTranslation();
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
    setPaymentAmount(formatMoneyInputValue(debt.amount));
    setPaymentError('');
  }, []);

  const openSimplifiedPaymentConfirm = useCallback((debt: SimplifiedDebt) => {
    setPendingPayment({ mode: 'simplified', debt });
    setPaymentAmount(formatMoneyInputValue(debt.amount));
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

    const parsed = parseMoneyAmount(paymentAmount);
    const maxAmount = pendingPayment.debt.amount;
    const validation = validatePaymentAmount(parsed, maxAmount);

    if (!validation.valid && validation.reason === 'invalid_amount') {
      setPaymentError(t('events.tabs.enterValidAmount'));
      return;
    }

    if (!validation.valid && validation.reason === 'exceeds_remaining') {
      setPaymentError(t('events.tabs.amountCannotExceed', { amount: formatCurrencyAmount(currencyCode, maxAmount) }));
      return;
    }

    if (!validation.valid) {
      setPaymentError(t('events.tabs.enterValidAmount'));
      return;
    }

    if (pendingPayment.mode === 'detailed') {
      onMarkDetailedPaid(pendingPayment.debt, validation.normalizedAmount);
    } else {
      onMarkSimplifiedPaid(pendingPayment.debt, validation.normalizedAmount);
    }

    closePaymentConfirm();
  }, [
    closePaymentConfirm,
    currencyCode,
    onMarkDetailedPaid,
    onMarkSimplifiedPaid,
    paymentAmount,
    pendingPayment,
    t,
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
      <Text
        variant="bodySmall"
        style={[styles.debtsSharedPaidHint, { color: theme.colors.onSurfaceVariant }]}
      >
        {mode === 'detailed'
          ? t('events.tabs.detailedHint')
          : t('events.tabs.simplifiedHint')}
      </Text>

      {mode === 'detailed' ? (
        detailedDebts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">{t('events.tabs.noBalancesYet')}</Text>
            <Text variant="bodyMedium">{t('events.addExpensesToSeeBalances')}</Text>
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
          <Text variant="titleMedium">{t('events.tabs.noBalancesYet')}</Text>
          <Text variant="bodyMedium">{t('events.addExpensesToSeeBalances')}</Text>
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
        title={t('events.tabs.markPaid')}
        onDismiss={closePaymentConfirm}
        onConfirm={handleConfirmPayment}
        onShow={handleConfirmShow}
        confirmText={t('events.tabs.savePayment')}
      >
        {pendingPayment ? (
          <View style={localStyles.sheetContent}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('events.tabs.transfer')}
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {pendingPayment.debt.from.name} {t('events.tabs.payTo', { name: pendingPayment.debt.to.name })}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('events.tabs.remaining', { amount: formatCurrencyAmount(currencyCode, pendingPayment.debt.amount) })}
            </Text>
            <Text variant="labelLarge" style={localStyles.amountLabel}>
              {t('events.tabs.amountWithCurrency', { currency: currencyCode })}
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
                placeholder={getAmountInputPlaceholder()}
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
  const handleRenderItem = useCallback(
    ({ item }: { item: T }) => renderItem({ item }),
    [renderItem],
  );

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
          renderItem={handleRenderItem}
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
  const { t } = useTranslation();
  const theme = useTheme();
  const isAllPaid = paidCount >= totalCount;
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event.nativeEvent.layout.height);
    },
    [onLayout],
  );

  return (
    <View
      onLayout={onLayout ? handleLayout : undefined}
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
          ? t('events.tabs.allTransfersPaid', { count: totalCount })
          : paidCount > 0
            ? t('events.tabs.paidLeft', { paid: paidCount, left: totalCount - paidCount })
            : t('events.tabs.markTransfersHint')}
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
  const { t } = useTranslation();
  const theme = useTheme();
  const handleMarkPaid = useCallback(() => {
      onMarkPaid(debt);
  }, [debt, onMarkPaid]);

  return (
    <View style={styles.rawDebtRow}>
      <View style={styles.rawDebtText}>
        <Text variant="titleMedium">{debt.from.name}</Text>
        <Text variant="bodyMedium">{t('events.tabs.payTo', { name: debt.to.name })}</Text>
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
          {t('events.tabs.markPaid')}
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
  const { t } = useTranslation();
  const theme = useTheme();
  const handleMarkPaid = useCallback(() => {
    onMarkPaid(debt);
  }, [debt, onMarkPaid]);

  return (
    <View style={styles.rawDebtRow}>
      <View style={styles.rawDebtText}>
        <Text variant="titleMedium">{debt.from.name}</Text>
        <Text variant="bodyMedium">{t('events.tabs.payTo', { name: debt.to.name })}</Text>
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
          {t('events.tabs.markPaid')}
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

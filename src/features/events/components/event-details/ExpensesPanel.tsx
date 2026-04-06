import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Checkbox, Icon, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExpenseItem } from '@/features/events/types/events';
import { AppList } from '@/shared/ui/AppList';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { formatCurrencyAmount, fromMinorUnits } from '@/shared/utils/money';
import { eventDetailsStyles as styles } from '@/features/events/components/event-details/styles';
import { useSelectionListMode } from '@/shared/hooks/useSelectionListMode';
import { SelectionDeleteConfirm } from '@/shared/ui/SelectionDeleteConfirm';

type ExpensesPanelProps = {
  expenses: ExpenseItem[];
  currencyCode: string;
  onRemoveExpenses: (expenseIds: string[]) => void;
  onOpenExpense: (expenseId: string) => void;
  onSelectionToolbarChange?: (state: ExpensesSelectionToolbarState | null) => void;
};

export type ExpensesSelectionToolbarState = {
  visible: boolean;
  title: string;
  totalSelectableCount: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export const ExpensesPanel = memo(function ExpensesPanel({
  expenses,
  currencyCode,
  onRemoveExpenses,
  onOpenExpense,
  onSelectionToolbarChange,
}: ExpensesPanelProps) {
  const { t } = useTranslation();
  const { isVisible: isDeleteConfirmVisible, open: openDeleteConfirm, close: closeDeleteConfirm } =
    useConfirmState();
  const {
    isEditMode,
    selectedIds,
    selectedSet,
    exitEditMode,
    toggleSelection,
    enterEditMode,
    getToolbarProps,
  } = useSelectionListMode<ExpenseItem>({
    items: expenses,
    enableBeforeRemoveExit: true,
  });

  const lastStateRef = useRef<{
    visible: boolean;
    selectedCount: number;
    totalSelectableCount: number;
  } | null>(null);

  useEffect(() => {
    if (!onSelectionToolbarChange) {
      return;
    }

    const toolbarProps = getToolbarProps(openDeleteConfirm);
    const newState = {
      visible: isEditMode,
      selectedCount: toolbarProps.selectedCount,
      totalSelectableCount: toolbarProps.totalSelectableCount,
    };

    // Only update parent if the meaningful state has changed
    if (
      lastStateRef.current &&
      lastStateRef.current.visible === newState.visible &&
      lastStateRef.current.selectedCount === newState.selectedCount &&
      lastStateRef.current.totalSelectableCount === newState.totalSelectableCount
    ) {
      return;
    }

    lastStateRef.current = newState;
    onSelectionToolbarChange({
      visible: isEditMode,
      ...toolbarProps,
    });

    return () => {
      onSelectionToolbarChange(null);
    };
  }, [
    getToolbarProps,
    isEditMode,
    openDeleteConfirm,
    onSelectionToolbarChange,
  ]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }
    onRemoveExpenses(selectedIds);
    closeDeleteConfirm();
    exitEditMode();
  }, [closeDeleteConfirm, exitEditMode, onRemoveExpenses, selectedIds]);

  const renderExpenseItem = useCallback(
    ({ item }: { item: ExpenseItem }) => (
      <ExpenseCard
        expense={item}
        currencyCode={currencyCode}
        selectable={isEditMode}
        selected={selectedSet.has(item.id)}
        onPress={isEditMode ? () => toggleSelection(item) : () => onOpenExpense(item.id)}
        onLongPress={!isEditMode ? () => enterEditMode(item) : undefined}
      />
    ),
    [currencyCode, enterEditMode, isEditMode, onOpenExpense, selectedSet, toggleSelection],
  );

  return (
    <>
      <AppList
        data={expenses}
        keyExtractor={(item) => item.id}
        containerStyle={styles.expensesListContainer}
        listStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        contentContainerStyle={[styles.listContent, expenses.length === 0 ? styles.listEmpty : null]}
        renderItem={({ item }) => renderExpenseItem({ item })}
        emptyComponent={
          <View style={styles.emptyState}>
            <Text variant="titleMedium">{t('events.addFirstExpense')}</Text>
            <Text variant="bodyMedium">{t('events.addExpensesToSeeBalances')}</Text>
          </View>
        }
        showDividers={false}
      />
      <SelectionDeleteConfirm
        visible={isDeleteConfirmVisible}
        title={t('events.deleteExpenses.title')}
        message={t('events.deleteExpenses.message')}
        onDismiss={closeDeleteConfirm}
        onConfirm={handleDeleteSelected}
      />
    </>
  );
});

type ExpenseCardProps = {
  expense: ExpenseItem;
  currencyCode: string;
  selectable: boolean;
  selected: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

const ExpenseCard = memo(function ExpenseCard({
  expense,
  currencyCode,
  selectable,
  selected,
  onPress,
  onLongPress,
}: ExpenseCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const longPressTriggeredRef = useRef(false);
  const pressedCardBackground = theme.dark ? 'rgba(147, 180, 255, 0.12)' : 'rgba(37, 99, 255, 0.08)';

  return (
    <Pressable
      onPress={() => {
        if (longPressTriggeredRef.current) {
          longPressTriggeredRef.current = false;
          return;
        }
        onPress?.();
      }}
      onLongPress={() => {
        longPressTriggeredRef.current = true;
        onLongPress?.();
      }}
      onPressIn={() => {
        longPressTriggeredRef.current = false;
      }}
    >
      {({ pressed }) => (
        <Card
          mode="contained"
          style={[
            styles.card,
            {
              borderColor: theme.colors.outlineVariant,
              backgroundColor: selected || pressed ? pressedCardBackground : theme.colors.surface,
            },
          ]}
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
                {t('events.report.paidBy')} {expense.paidBy}
              </Text>
            </View>
            <Text variant="titleMedium" style={styles.amount}>
              {formatCurrencyAmount(currencyCode, fromMinorUnits(expense.amountMinor))}
            </Text>
          </Card.Content>
          {selectable ? (
            <View pointerEvents="none" style={localStyles.checkboxOverlay}>
              <Checkbox status={selected ? 'checked' : 'unchecked'} />
            </View>
          ) : null}
        </Card>
      )}
    </Pressable>
  );
});

const localStyles = StyleSheet.create({
  checkboxOverlay: {
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 2,
  },
});

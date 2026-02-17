import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Checkbox, Icon, Text, useTheme } from 'react-native-paper';
import { ExpenseItem } from '@/features/events/types/events';
import { AppList } from '@/shared/ui/AppList';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { formatCurrencyAmount } from '@/shared/utils/currency';
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

  useEffect(() => {
    if (!onSelectionToolbarChange) {
      return;
    }

    onSelectionToolbarChange({
      visible: isEditMode,
      ...getToolbarProps(openDeleteConfirm),
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
            <Text variant="titleMedium">No expenses yet</Text>
            <Text variant="bodyMedium">Add expenses to see who owes whom.</Text>
          </View>
        }
        showDividers={false}
      />
      <SelectionDeleteConfirm
        visible={isDeleteConfirmVisible}
        title="Delete expenses"
        message="Selected expenses and all related debt data will be deleted."
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
                Paid by {expense.paidBy}
              </Text>
            </View>
            <Text variant="titleMedium" style={styles.amount}>
              {formatCurrencyAmount(currencyCode, expense.amount)}
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

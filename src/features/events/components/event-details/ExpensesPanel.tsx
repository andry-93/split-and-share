import React, { memo, useCallback } from 'react';
import { View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { ExpenseItem } from '../../types/events';
import { AppList } from '../../../../shared/ui/AppList';
import { formatCurrencyAmount } from '../../../../shared/utils/currency';
import { eventDetailsStyles as styles } from './styles';

type ExpensesPanelProps = {
  expenses: ExpenseItem[];
  currencyCode: string;
};

export const ExpensesPanel = memo(function ExpensesPanel({
  expenses,
  currencyCode,
}: ExpensesPanelProps) {
  const renderExpenseItem = useCallback(
    ({ item }: { item: ExpenseItem }) => <ExpenseCard expense={item} currencyCode={currencyCode} />,
    [currencyCode],
  );

  return (
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


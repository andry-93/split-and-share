import React, { memo } from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { eventDetailsStyles as styles } from './styles';

type SummaryProps = {
  totalAmountDisplay: string;
  participantsCount: number;
  expensesCount: number;
};

type SummaryMetricProps = {
  label: string;
  value: string;
};

export const Summary = memo(function Summary({
  totalAmountDisplay,
  participantsCount,
  expensesCount,
}: SummaryProps) {
  const theme = useTheme();

  return (
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
  );
});

const SummaryMetric = memo(function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <View style={styles.metric}>
      <Text variant="labelMedium">{label}</Text>
      <Text variant="titleMedium">{value}</Text>
    </View>
  );
});


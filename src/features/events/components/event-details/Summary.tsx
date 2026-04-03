import React, { Fragment, memo } from 'react';
import { Pressable, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getListPressedBackground } from '@/shared/ui/listPressState';
import { eventDetailsStyles as styles } from '@/features/events/components/event-details/styles';

type SummaryProps = {
  totalAmountDisplay: string;
  participantsCount: number;
  expensesCount: number;
  outstanding?: {
    modeLabel: string;
    amountDisplay: string;
    transfersCount: number;
    onPress?: () => void;
  };
};

type SummaryMetricProps = {
  label: string;
  value: string;
};

export const Summary = memo(function Summary({
  totalAmountDisplay,
  participantsCount,
  expensesCount,
  outstanding,
}: SummaryProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const metrics = [
    { key: 'total', label: t('events.totals.total'), value: totalAmountDisplay },
    { key: 'people', label: t('events.totals.people'), value: `${participantsCount}` },
    { key: 'expenses', label: t('events.totals.expenses'), value: `${expensesCount}` },
  ] as const;

  return (
    <Card
      mode="contained"
      style={[
        styles.summaryCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
      ]}
    >
      <Card.Content style={styles.summaryContent}>
        <View style={styles.summaryMetricsRow}>
          {metrics.map((metric, index) => (
            <Fragment key={metric.key}>
              <SummaryMetric
                label={metric.label}
                value={metric.value}
              />
              {index < metrics.length - 1 ? (
                <View
                  style={[
                    styles.summaryMetricDivider,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />
              ) : null}
            </Fragment>
          ))}
        </View>
      </Card.Content>
      {outstanding ? (
        <Pressable
          onPress={outstanding.onPress}
          accessibilityRole={outstanding.onPress ? 'button' : undefined}
          accessibilityLabel={outstanding.onPress ? t('events.totals.openDebtsAction') : undefined}
          style={({ pressed }) => [
            styles.summaryOutstandingRow,
            { borderTopColor: theme.colors.outlineVariant },
            pressed ? { backgroundColor: getListPressedBackground(theme.dark) } : null,
          ]}
        >
          <View style={styles.summaryOutstandingMeta}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('events.totals.openBalance')}
              </Text>
            <View style={[styles.summaryModeChip, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {outstanding.modeLabel}
              </Text>
            </View>
          </View>
          <View style={styles.summaryOutstandingValue}>
            {outstanding.transfersCount > 0 ? (
              <>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                  {outstanding.amountDisplay}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('events.totals.transfers', { count: outstanding.transfersCount })}
                </Text>
              </>
            ) : (
              <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('events.totals.settled')}
              </Text>
            )}
          </View>
        </Pressable>
      ) : null}
    </Card>
  );
});

const SummaryMetric = memo(function SummaryMetric({ label, value }: SummaryMetricProps) {
  const theme = useTheme();

  return (
    <View style={styles.metric}>
      <Text variant="labelSmall" style={[styles.metricLabel, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <Text
        variant="titleMedium"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        style={[styles.metricValue, { color: theme.colors.onSurface }]}
      >
        {value}
      </Text>
    </View>
  );
});

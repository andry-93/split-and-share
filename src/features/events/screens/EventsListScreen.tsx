import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, FAB, Icon, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsState } from '../../../state/events/eventsContext';
import { PaymentEntry, selectEffectiveRawDebts, selectPayments, selectRawDebts, selectTotalAmount } from '../../../state/events/eventsSelectors';
import { usePeopleState } from '../../../state/people/peopleContext';
import { selectCurrentUser } from '../../../state/people/peopleSelectors';
import { useSettingsState } from '../../../state/settings/settingsContext';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { EventItem } from '../types/events';
import { formatCurrencyAmount, normalizeCurrencyCode } from '../../../shared/utils/currency';
import { AppHeader } from '../../../shared/ui/AppHeader';

type EventsListScreenProps = NativeStackScreenProps<EventsStackParamList, 'Events'>;

export function EventsListScreen({ navigation }: EventsListScreenProps) {
  const theme = useTheme();
  const { events, paymentsByEvent } = useEventsState();
  const { people } = usePeopleState();
  const settings = useSettingsState();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const currencyCode = useMemo(() => normalizeCurrencyCode(settings.currency), [settings.currency]);
  const currentUserId = useMemo(() => selectCurrentUser(people)?.id, [people]);

  const handlePressEvent = useCallback(
    (eventId: string) => {
      navigation.navigate('EventDetails', { eventId });
    },
    [navigation],
  );

  const renderEventItem = useCallback(
    ({ item, index }: { item: EventItem; index: number }) => (
      <EventCard
        event={item}
        index={index}
        onPress={handlePressEvent}
        fallbackCurrencyCode={currencyCode}
        payments={selectPayments({ events, paymentsByEvent }, item.id)}
        currentUserId={currentUserId}
      />
    ),
    [currencyCode, currentUserId, events, handlePressEvent, paymentsByEvent],
  );

  const filteredEvents = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return events;
    }

    return events.filter((event) => event.name.toLowerCase().includes(normalized));
  }, [debouncedQuery, events]);

  const handleAddEvent = useCallback(() => {
    navigation.navigate('AddEvent');
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Events" />

      <Searchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search events"
        style={[styles.search, { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.outlineVariant }]}
        inputStyle={styles.searchInput}
      />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        style={styles.list}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        contentContainerStyle={[
          styles.listContent,
          filteredEvents.length === 0 ? styles.listEmpty : null,
        ]}
        renderItem={renderEventItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="bodyMedium">No events found</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, styles.fabNoShadow, { backgroundColor: '#2563FF' }]}
        color="#FFFFFF"
        onPress={handleAddEvent}
      />
    </SafeAreaView>
  );
}

type EventCardProps = {
  event: EventItem;
  index: number;
  onPress: (eventId: string) => void;
  fallbackCurrencyCode: string;
  payments: PaymentEntry[];
  currentUserId?: string;
};

function buildEventDate(index: number) {
  const day = 5 + index * 5;
  return `Dec ${day}, 2024`;
}

const EventCard = memo(function EventCard({ event, index, onPress, fallbackCurrencyCode, payments, currentUserId }: EventCardProps) {
  const theme = useTheme();
  const eventCurrencyCode = useMemo(
    () => normalizeCurrencyCode(event.currency ?? fallbackCurrencyCode),
    [event.currency, fallbackCurrencyCode],
  );
  const handlePress = useCallback(() => {
    onPress(event.id);
  }, [event.id, onPress]);
  const total = useMemo(() => selectTotalAmount(event), [event]);
  const rawDebts = useMemo(() => selectRawDebts(event), [event]);
  const effectiveDebts = useMemo(() => selectEffectiveRawDebts(rawDebts, payments), [payments, rawDebts]);
  const status = useMemo(() => {
    const currentUser = event.participants.find((participant) => participant.id === currentUserId);
    if (!currentUser) {
      return { text: 'Settled', tone: 'neutral' as const };
    }

    let balance = 0;
    effectiveDebts.forEach((debt) => {
      if (debt.from.id === currentUser.id) {
        balance -= debt.amount;
      }
      if (debt.to.id === currentUser.id) {
        balance += debt.amount;
      }
    });

    if (Math.abs(balance) < 0.005) {
      return { text: 'Settled', tone: 'neutral' as const };
    }
    if (balance > 0) {
      return { text: `You get ${formatCurrencyAmount(eventCurrencyCode, balance)}`, tone: 'positive' as const };
    }
    return { text: `You owe ${formatCurrencyAmount(eventCurrencyCode, Math.abs(balance))}`, tone: 'negative' as const };
  }, [currentUserId, effectiveDebts, event.participants, eventCurrencyCode]);

  const statusStyle = useMemo(() => {
    if (status.tone === 'positive') {
      return {
        backgroundColor: 'rgba(22, 163, 74, 0.16)',
        color: '#22C55E',
        borderColor: '#16A34A',
      };
    }
    if (status.tone === 'negative') {
      return {
        backgroundColor: theme.colors.errorContainer,
        color: theme.colors.onErrorContainer,
        borderColor: theme.colors.error,
      };
    }
    return {
      backgroundColor: theme.colors.surface,
      color: theme.colors.onSurfaceVariant,
      borderColor: theme.colors.outlineVariant,
    };
  }, [status.tone, theme.colors.error, theme.colors.errorContainer, theme.colors.onErrorContainer, theme.colors.onSurfaceVariant, theme.colors.outlineVariant, theme.colors.surface]);

  return (
    <Card
      mode="contained"
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
      onPress={handlePress}
    >
      <Card.Content style={styles.cardContent}>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {event.name}
        </Text>
        <View style={styles.dateRow}>
          <Icon source="calendar-blank-outline" size={18} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {buildEventDate(index)}
          </Text>
        </View>
        <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={styles.totalRow}>
          <View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total
            </Text>
            <Text variant="titleMedium">{formatCurrencyAmount(eventCurrencyCode, total)}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
            <Text variant="labelSmall" style={{ color: statusStyle.color }}>
              {status.text}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 12,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchInput: {
    marginVertical: 0,
    minHeight: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 96,
  },
  listEmpty: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  cardContent: {
    paddingVertical: 12,
  },
  cardTitle: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    marginVertical: 8,
    height: StyleSheet.hairlineWidth,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statusPill: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});

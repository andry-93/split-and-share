import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { Card, Checkbox, Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { EventsStackParamList } from '@/navigation/types';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { PaymentEntry, selectEffectiveRawDebts, selectPayments, selectRawDebts, selectTotalAmount } from '@/state/events/eventsSelectors';
import { usePeopleState } from '@/state/people/peopleContext';
import { selectCurrentUser } from '@/state/people/peopleSelectors';
import { useSettingsState } from '@/state/settings/settingsContext';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useSelectionMode } from '@/shared/hooks/useSelectionMode';
import { EventItem } from '@/features/events/types/events';
import { formatCurrencyAmount, normalizeCurrencyCode } from '@/shared/utils/currency';
import { AppHeader } from '@/shared/ui/AppHeader';
import { AppList } from '@/shared/ui/AppList';
import { DraggableFab } from '@/shared/ui/DraggableFab';
import { AppSearchbar } from '@/shared/ui/AppSearchbar';
import { SelectionActionToolbar } from '@/shared/ui/SelectionActionToolbar';
import { AppConfirm } from '@/shared/ui/AppConfirm';
import { BottomTabSwipeBoundary } from '@/shared/ui/BottomTabSwipeBoundary';

type EventsListScreenProps = NativeStackScreenProps<EventsStackParamList, 'Events'>;

export function EventsListScreen({ navigation }: EventsListScreenProps) {
  const theme = useTheme();
  const { events, paymentsByEvent } = useEventsState();
  const { removeEvents } = useEventsActions();
  const { people } = usePeopleState();
  const settings = useSettingsState();
  const [query, setQuery] = useState('');
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);
  const currencyCode = useMemo(() => normalizeCurrencyCode(settings.currency), [settings.currency]);
  const currentUserId = useMemo(() => selectCurrentUser(people)?.id, [people]);

  const handleOpenEvent = useCallback(
    (eventId: string) => {
      navigation.navigate('EventDetails', { eventId });
    },
    [navigation],
  );

  const filteredEvents = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return events;
    }

    return events.filter((event) => event.name.toLowerCase().includes(normalized));
  }, [debouncedQuery, events]);

  const {
    isEditMode,
    selectedIds,
    selectedSet,
    selectableIds,
    exitEditMode,
    toggleSelection,
    enterEditMode,
    toggleSelectAll,
  } = useSelectionMode<EventItem>({
    items: filteredEvents,
  });

  const renderEventItem = useCallback(
    ({ item }: { item: EventItem }) => (
      <EventCard
        event={item}
        selectable={isEditMode}
        selected={selectedSet.has(item.id)}
        onPress={() => {
          if (isEditMode) {
            toggleSelection(item);
            return;
          }
          handleOpenEvent(item.id);
        }}
        onLongPress={() => {
          if (!isEditMode) {
            enterEditMode(item);
          }
        }}
        fallbackCurrencyCode={currencyCode}
        payments={selectPayments({ events, paymentsByEvent }, item.id)}
        currentUserId={currentUserId}
      />
    ),
    [
      currencyCode,
      currentUserId,
      enterEditMode,
      events,
      handleOpenEvent,
      isEditMode,
      paymentsByEvent,
      selectedSet,
      toggleSelection,
    ],
  );

  const handleAddEvent = useCallback(() => {
    navigation.navigate('AddEvent');
  }, [navigation]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }
    removeEvents({ eventIds: selectedIds });
    setIsDeleteConfirmVisible(false);
    exitEditMode();
  }, [exitEditMode, removeEvents, selectedIds]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!isEditMode) {
          return false;
        }
        exitEditMode();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [exitEditMode, isEditMode]),
  );

  return (
    <BottomTabSwipeBoundary currentTab="EventsTab" enabled={!isEditMode}>
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      {isEditMode ? (
        <SelectionActionToolbar
          title={`Selected ${selectedIds.length}`}
          totalSelectableCount={selectableIds.length}
          selectedCount={selectedIds.length}
          onToggleSelectAll={toggleSelectAll}
          onDelete={() => setIsDeleteConfirmVisible(true)}
          onClose={exitEditMode}
        />
      ) : (
        <AppHeader title="Events" />
      )}

      <AppSearchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search events"
        style={styles.search}
      />

      <AppList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        containerStyle={styles.eventsListContainer}
        listStyle={styles.list}
        contentContainerStyle={[
          styles.listContent,
          filteredEvents.length === 0 ? styles.listEmpty : null,
        ]}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        renderItem={({ item }) => renderEventItem({ item })}
        emptyComponent={
          <View style={styles.emptyState}>
            <Text variant="bodyMedium">No events found</Text>
          </View>
        }
        showDividers={false}
      />

      {!isEditMode ? (
        <DraggableFab
          icon="plus"
          color="#FFFFFF"
          backgroundColor="#2563FF"
          onPress={handleAddEvent}
          topBoundary={124}
        />
      ) : null}

      <AppConfirm
        visible={isDeleteConfirmVisible}
        title="Delete events"
        onDismiss={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleDeleteSelected}
        confirmText="Delete"
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Selected events and all related data will be deleted.
        </Text>
      </AppConfirm>
      </SafeAreaView>
    </BottomTabSwipeBoundary>
  );
}

type EventCardProps = {
  event: EventItem;
  selectable: boolean;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  fallbackCurrencyCode: string;
  payments: PaymentEntry[];
  currentUserId?: string;
};

function formatEventDate(dateValue?: string | null) {
  if (!dateValue) {
    return '';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

const EventCard = memo(function EventCard({
  event,
  selectable,
  selected,
  onPress,
  onLongPress,
  fallbackCurrencyCode,
  payments,
  currentUserId,
}: EventCardProps) {
  const theme = useTheme();
  const longPressTriggeredRef = useRef(false);
  const pressedCardBackground = theme.dark ? 'rgba(147, 180, 255, 0.12)' : 'rgba(37, 99, 255, 0.08)';
  const eventCurrencyCode = useMemo(
    () => normalizeCurrencyCode(event.currency ?? fallbackCurrencyCode),
    [event.currency, fallbackCurrencyCode],
  );
  const eventDate = useMemo(() => formatEventDate(event.date), [event.date]);
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
    <Pressable
      onPress={() => {
        if (longPressTriggeredRef.current) {
          longPressTriggeredRef.current = false;
          return;
        }
        onPress();
      }}
      onLongPress={() => {
        longPressTriggeredRef.current = true;
        onLongPress();
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
              backgroundColor: selected || pressed ? pressedCardBackground : theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {event.name}
            </Text>
            {eventDate ? (
              <>
                <View style={styles.dateRow}>
                  <Icon source="calendar-blank-outline" size={18} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {eventDate}
                  </Text>
                </View>
                <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
              </>
            ) : null}
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
          {selectable ? (
            <View pointerEvents="none" style={styles.eventCheckboxOverlay}>
              <Checkbox status={selected ? 'checked' : 'unchecked'} />
            </View>
          ) : null}
        </Card>
      )}
    </Pressable>
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
  },
  list: {
    flex: 1,
  },
  eventsListContainer: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  listEmpty: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
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
  eventCheckboxOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

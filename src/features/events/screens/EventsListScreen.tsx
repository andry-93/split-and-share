import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Appbar, Card, Checkbox, Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AddEventActionSheet } from '@/features/events/components/AddEventActionSheet';
import { EventListEntry, useEventsListModel } from '@/features/events/hooks/useEventsListModel';
import { EventGroupItem, EventItem } from '@/features/events/types/events';
import { EventsStackParamList } from '@/navigation/types';
import { AppHeader } from '@/shared/ui/AppHeader';
import { AppList } from '@/shared/ui/AppList';
import { AppTheme } from '@/app/theme';
import { AppSearchbar } from '@/shared/ui/AppSearchbar';
import { BottomTabSwipeBoundary } from '@/shared/ui/BottomTabSwipeBoundary';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { DraggableFab } from '@/shared/ui/DraggableFab';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { useSelectionListMode } from '@/shared/hooks/useSelectionListMode';
import { normalizeCurrencyCode } from '@/shared/utils/currency';
import { formatShortEventDate } from '@/shared/utils/date';
import { formatCurrencyAmount, fromMinorUnits } from '@/shared/utils/money';
import { getLanguageLocale } from '@/state/settings/languageCatalog';
import { SelectionActionToolbar } from '@/shared/ui/SelectionActionToolbar';
import { SelectionDeleteConfirm } from '@/shared/ui/SelectionDeleteConfirm';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import {
  createEventCardSelectors,
  PaymentEntry,
} from '@/state/events/eventsSelectors';
import { selectCurrentUser } from '@/state/people/peopleSelectors';
import { usePeopleState } from '@/state/people/peopleContext';
import { useSettingsState } from '@/state/settings/settingsContext';
import { PremiumPressable } from '@/shared/ui/PremiumPressable';
import { Shadows, Spacing, Typography } from '@/shared/ui/theme/styles';

type EventsListScreenProps = NativeStackScreenProps<EventsStackParamList, 'Events'>;

export function EventsListScreen({ navigation, route }: EventsListScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme() as AppTheme;
  const eventsState = useEventsState();
  const { removeEvents, removeGroups } = useEventsActions();
  const { people } = usePeopleState();
  const settings = useSettingsState();
  const [query, setQuery] = useState('');
  const { isVisible: isDeleteConfirmVisible, open: openDeleteConfirm, close: closeDeleteConfirm } =
    useConfirmState();
  const createSheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([createSheetRef]);

  const groupId = route.params?.groupId;
  const debouncedQuery = useDebouncedValue(query, 250);
  const currencyCode = useMemo(() => normalizeCurrencyCode(settings.currency), [settings.currency]);
  const languageLocale = useMemo(() => getLanguageLocale(settings.language), [settings.language]);
  const currentUserId = useMemo(() => selectCurrentUser(people)?.id, [people]);
  const { currentGroup, effectiveGroupId, listEntries } = useEventsListModel({
    eventsState,
    groupId,
    query: debouncedQuery,
  });

  const {
    isEditMode,
    selectedIds,
    selectedSet,
    exitEditMode,
    toggleSelection,
    enterEditMode,
    getToolbarProps,
  } = useSelectionListMode<EventListEntry>({
    items: listEntries,
  });

  const handleOpenEvent = useCallback(
    (eventId: string) => {
      navigation.navigate('EventDetails', { eventId });
    },
    [navigation],
  );

  const handleOpenGroup = useCallback(
    (nextGroupId: string) => {
      navigation.push('Events', { groupId: nextGroupId });
    },
    [navigation],
  );

  const handleEditGroup = useCallback(() => {
    if (!currentGroup) {
      return;
    }
    navigation.navigate('AddGroup', { groupId: currentGroup.id });
  }, [currentGroup, navigation]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }

    const selectedGroupIds: string[] = [];
    const selectedEventIds: string[] = [];
    selectedIds.forEach((entryId) => {
      if (entryId.startsWith('group:')) {
        selectedGroupIds.push(entryId.replace('group:', ''));
      } else if (entryId.startsWith('event:')) {
        selectedEventIds.push(entryId.replace('event:', ''));
      }
    });

    if (selectedGroupIds.length > 0) {
      removeGroups({ groupIds: selectedGroupIds });
    }
    if (selectedEventIds.length > 0) {
      removeEvents({ eventIds: selectedEventIds });
    }

    closeDeleteConfirm();
    exitEditMode();
  }, [closeDeleteConfirm, exitEditMode, removeEvents, removeGroups, selectedIds]);

  const handleAddEvent = useCallback(() => {
    createSheetRef.current?.dismiss();
    navigation.navigate('AddEvent', { groupId: effectiveGroupId });
  }, [effectiveGroupId, navigation]);

  const handleAddGroup = useCallback(() => {
    createSheetRef.current?.dismiss();
    navigation.navigate('AddGroup');
  }, [navigation]);

  const handleFabPress = useCallback(() => {
    if (effectiveGroupId) {
      navigation.navigate('AddEvent', { groupId: effectiveGroupId });
      return;
    }
    createSheetRef.current?.present();
  }, [effectiveGroupId, navigation]);

  const renderListItem = useCallback(
    ({ item }: { item: EventListEntry }) => {
      const selected = selectedSet.has(item.id);
      if (item.kind === 'group') {
        return (
          <GroupEntryRow
            group={item.group}
            eventsCount={item.eventsCount}
            item={item}
            selectable={isEditMode}
            selected={selected}
            onToggleSelection={toggleSelection}
            onEnterEditMode={enterEditMode}
            onOpenGroup={handleOpenGroup}
          />
        );
      }

      return (
          <EventEntryRow
          event={item.event}
          item={item}
          selectable={isEditMode}
          selected={selected}
          onToggleSelection={toggleSelection}
          onEnterEditMode={enterEditMode}
          onOpenEvent={handleOpenEvent}
          fallbackCurrencyCode={currencyCode}
          languageLocale={languageLocale}
          payments={item.payments}
          currentUserId={currentUserId}
        />
      );
    },
    [
      currencyCode,
      currentUserId,
      languageLocale,
      enterEditMode,
      handleOpenEvent,
      handleOpenGroup,
      isEditMode,
      selectedSet,
      toggleSelection,
    ],
  );

  const emptyText = currentGroup ? t('events.noEventsInGroup') : t('events.noEventsOrGroupsFound');

  const headerTitle = currentGroup?.name ?? t('navigation.events');

  return (
    <BottomTabSwipeBoundary currentTab="EventsTab" enabled={!isEditMode}>
      <SafeAreaView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        edges={['top', 'left', 'right']}
      >
        {isEditMode ? (
          <SelectionActionToolbar
            {...getToolbarProps(openDeleteConfirm)}
          />
        ) : (
          <AppHeader
            title={headerTitle}
            onBackPress={currentGroup ? () => navigation.goBack() : undefined}
            rightSlot={
              currentGroup ? <Appbar.Action icon="pencil-outline" onPress={handleEditGroup} /> : undefined
            }
          />
        )}

        <View style={styles.contentWrapper}>
          <AppSearchbar
            value={query}
            onChangeText={setQuery}
            placeholder={currentGroup ? t('navigation.events') : t('events.searchEventsOrGroups')}
            style={styles.search}
          />

          <AppList
            data={listEntries}
            keyExtractor={(item) => item.id}
            containerStyle={styles.eventsListContainer}
            listStyle={styles.list}
            contentContainerStyle={[styles.listContent, listEntries.length === 0 ? styles.listEmpty : null]}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            renderItem={renderListItem}
            emptyComponent={
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={styles.emptyStateText}>{emptyText}</Text>
              </View>
            }
            showDividers={false}
          />
        </View>

        {!isEditMode ? (
          <>
            <DraggableFab
              icon="plus"
              color={theme.colors.onPrimary}
              backgroundColor={theme.colors.primary}
              onPress={handleFabPress}
              topBoundary={124}
            />
            {!effectiveGroupId ? (
              <AddEventActionSheet
                ref={createSheetRef}
                onAddEvent={handleAddEvent}
                onAddGroup={handleAddGroup}
              />
            ) : null}
          </>
        ) : null}

        <SelectionDeleteConfirm
          visible={isDeleteConfirmVisible}
          title={t('common.delete')}
          message={t('events.deleteSelectedMessage')}
          onDismiss={closeDeleteConfirm}
          onConfirm={handleDeleteSelected}
        />
      </SafeAreaView>
    </BottomTabSwipeBoundary>
  );
}

type GroupCardProps = {
  group: EventGroupItem;
  eventsCount: number;
  selectable: boolean;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

type GroupEntryRowProps = {
  item: Extract<EventListEntry, { kind: 'group' }>;
  group: EventGroupItem;
  eventsCount: number;
  selectable: boolean;
  selected: boolean;
  onToggleSelection: (item: EventListEntry) => void;
  onEnterEditMode: (item: EventListEntry) => void;
  onOpenGroup: (groupId: string) => void;
};

const GroupEntryRow = memo(function GroupEntryRow({
  item,
  group,
  eventsCount,
  selectable,
  selected,
  onToggleSelection,
  onEnterEditMode,
  onOpenGroup,
}: GroupEntryRowProps) {
  const handlePress = useCallback(() => {
    if (selectable) {
      onToggleSelection(item);
      return;
    }
    onOpenGroup(group.id);
  }, [group.id, item, onOpenGroup, onToggleSelection, selectable]);

  const handleLongPress = useCallback(() => {
    if (!selectable) {
      onEnterEditMode(item);
    }
  }, [item, onEnterEditMode, selectable]);

  return (
    <GroupCard
      group={group}
      eventsCount={eventsCount}
      selectable={selectable}
      selected={selected}
      onPress={handlePress}
      onLongPress={handleLongPress}
    />
  );
});

type EventEntryRowProps = {
  item: Extract<EventListEntry, { kind: 'event' }>;
  event: EventItem;
  selectable: boolean;
  selected: boolean;
  onToggleSelection: (item: EventListEntry) => void;
  onEnterEditMode: (item: EventListEntry) => void;
  onOpenEvent: (eventId: string) => void;
  fallbackCurrencyCode: string;
  languageLocale: string;
  payments: PaymentEntry[];
  currentUserId?: string;
};

const EventEntryRow = memo(function EventEntryRow({
  item,
  event,
  selectable,
  selected,
  onToggleSelection,
  onEnterEditMode,
  onOpenEvent,
  fallbackCurrencyCode,
  languageLocale,
  payments,
  currentUserId,
}: EventEntryRowProps) {
  const handlePress = useCallback(() => {
    if (selectable) {
      onToggleSelection(item);
      return;
    }
    onOpenEvent(event.id);
  }, [event.id, item, onOpenEvent, onToggleSelection, selectable]);

  const handleLongPress = useCallback(() => {
    if (!selectable) {
      onEnterEditMode(item);
    }
  }, [item, onEnterEditMode, selectable]);

  return (
    <EventCard
      event={event}
      selectable={selectable}
      selected={selected}
      onPress={handlePress}
      onLongPress={handleLongPress}
      fallbackCurrencyCode={fallbackCurrencyCode}
      languageLocale={languageLocale}
      payments={payments}
      currentUserId={currentUserId}
    />
  );
});

const GroupCard = memo(function GroupCard({
  group,
  eventsCount,
  selectable,
  selected,
  onPress,
  onLongPress,
}: GroupCardProps) {
  const theme = useTheme();
  const pressedCardBackground = theme.dark ? 'rgba(147, 180, 255, 0.12)' : 'rgba(37, 99, 255, 0.08)';

  return (
    <PremiumPressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.cardPressable}
    >
      <Card
        mode="contained"
        style={[
          styles.card,
          {
            backgroundColor: selected ? pressedCardBackground : theme.colors.surface,
            borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
            borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
          },
          Shadows.soft,
        ]}
      >
        <Card.Content style={styles.groupCardContent}>
          <View style={styles.groupHeader}>
            <View style={[styles.groupIconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
              <Icon source="folder-outline" size={16} color={theme.colors.primary} />
              <View style={[styles.groupIconCountBubble, { backgroundColor: theme.colors.primary }]}>
                <Text variant="labelSmall" style={[styles.groupIconCountText, { color: theme.colors.onPrimary }]}>
                  {eventsCount > 99 ? '99+' : String(eventsCount)}
                </Text>
              </View>
            </View>
            <View style={styles.groupMeta}>
              <View style={styles.groupTitleRow}>
                <Text 
                  variant="titleSmall" 
                  numberOfLines={1} 
                  style={[styles.groupTitleText, { fontWeight: Typography.weights.semiBold as any }]}
                >
                  {group.name}
                </Text>
              </View>
              {group.description ? (
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {group.description}
                </Text>
              ) : null}
            </View>
            <View style={styles.groupRight}>
              {!selectable ? (
                <Icon source="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
              ) : null}
            </View>
          </View>
        </Card.Content>
        {selectable ? (
          <View pointerEvents="none" style={styles.eventCheckboxOverlay}>
            <Checkbox status={selected ? 'checked' : 'unchecked'} />
          </View>
        ) : null}
      </Card>
    </PremiumPressable>
  );
});

type EventCardProps = {
  event: EventItem;
  selectable: boolean;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  fallbackCurrencyCode: string;
  languageLocale: string;
  payments: PaymentEntry[];
  currentUserId?: string;
};

const EventCard = memo(function EventCard({
  event,
  selectable,
  selected,
  onPress,
  onLongPress,
  fallbackCurrencyCode,
  languageLocale,
  payments,
  currentUserId,
}: EventCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const pressedCardBackground = theme.dark ? 'rgba(147, 180, 255, 0.12)' : 'rgba(37, 99, 255, 0.08)';
  const selectors = useMemo(() => createEventCardSelectors(), []);
  const eventCurrencyCode = useMemo(
    () => normalizeCurrencyCode(event.currency ?? fallbackCurrencyCode),
    [event.currency, fallbackCurrencyCode],
  );
  const eventDate = useMemo(
    () => formatShortEventDate(event.date, languageLocale),
    [event.date, languageLocale],
  );
  const total = useMemo(() => selectors.selectTotalMemo(event), [event, selectors]);
  const rawDebts = useMemo(() => selectors.selectRawDebtsMemo(event), [event, selectors]);
  const effectiveDebts = useMemo(
    () => selectors.selectEffectiveRawDebtsMemo(rawDebts, payments),
    [payments, rawDebts, selectors],
  );
  const status = useMemo(() => {
    const currentUser = event.participants.find((participant) => participant.id === currentUserId);
    if (!currentUser) {
      return { text: t('events.cards.settled'), tone: 'neutral' as const };
    }

    let balance = 0;
    effectiveDebts.forEach((debt) => {
      if (debt.from.id === currentUser.id) {
        balance -= debt.amountMinor;
      }
      if (debt.to.id === currentUser.id) {
        balance += debt.amountMinor;
      }
    });

    if (Math.abs(balance) < 0.5) {
      return { text: t('events.cards.settled'), tone: 'neutral' as const };
    }
    if (balance > 0) {
      return {
        text: t('events.cards.collect', { amount: formatCurrencyAmount(eventCurrencyCode, fromMinorUnits(balance)) }),
        tone: 'positive' as const,
      };
    }
    return {
      text: t('events.cards.pay', { amount: formatCurrencyAmount(eventCurrencyCode, fromMinorUnits(Math.abs(balance))) }),
      tone: 'negative' as const,
    };
  }, [currentUserId, effectiveDebts, event.participants, eventCurrencyCode, t]);

  const statusStyle = useMemo(() => {
    if (status.tone === 'positive') {
      return {
        backgroundColor: theme.colors.successContainer,
        color: theme.colors.onSuccessContainer,
        borderColor: theme.colors.outlineVariant,
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
  }, [
    status.tone,
    theme.colors.error,
    theme.colors.errorContainer,
    theme.colors.onErrorContainer,
    theme.colors.onSurfaceVariant,
    theme.colors.outlineVariant,
    theme.colors.surface,
    theme.colors.successContainer,
    theme.colors.onSuccessContainer,
  ]);

  return (
    <PremiumPressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.cardPressable}
    >
      <Card
        mode="contained"
        style={[
          styles.card,
          {
            backgroundColor: selected ? pressedCardBackground : theme.colors.surface,
            borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
            borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
          },
          Shadows.soft,
        ]}
      >
        <Card.Content style={styles.cardContent}>
          <Text 
            variant="titleMedium" 
            style={[styles.cardTitle, { fontWeight: Typography.weights.semiBold as any }]}
          >
            {event.name}
          </Text>
          {eventDate ? (
            <>
              <View style={styles.dateRow}>
                <Icon source="calendar-blank-outline" size={16} color={theme.colors.onSurfaceVariant} />
                <Text 
                  variant="bodySmall" 
                  style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}
                >
                  {eventDate}
                </Text>
              </View>
              <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            </>
          ) : null}
          <View style={styles.totalRow}>
            <View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 2 }}>
                {t('events.totals.total')}
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: Typography.weights.bold as any }}>
                {formatCurrencyAmount(eventCurrencyCode, total)}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor },
              ]}
            >
              <Text 
                variant="labelSmall" 
                style={{ color: statusStyle.color, fontWeight: Typography.weights.medium as any }}
              >
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
    </PremiumPressable>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingTop: Spacing.s,
  },
  search: {
    marginHorizontal: Spacing.l,
    marginBottom: Spacing.m,
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
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.huge, // Space for FAB
  },
  listEmpty: {
    flexGrow: 1,
  },
  cardPressable: {
    marginBottom: Spacing.s,
  },
  card: {
    borderRadius: 16,
    overflow: 'visible', // Allow shadows to show
  },
  cardContent: {
    paddingVertical: Spacing.m,
  },
  groupCardContent: {
    paddingVertical: Spacing.m - 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  groupIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupMeta: {
    flex: 1,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  groupTitleText: {
    flex: 1,
  },
  groupIconCountBubble: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff', // Better separation
  },
  groupIconCountText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
  },
  groupRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.s,
    width: 20,
    justifyContent: 'center',
  },
  cardTitle: {
    marginBottom: Spacing.s,
    letterSpacing: Typography.letterSpacing.tight,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  separator: {
    marginVertical: Spacing.m,
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statusPill: {
    borderRadius: 10,
    borderWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  eventCheckboxOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

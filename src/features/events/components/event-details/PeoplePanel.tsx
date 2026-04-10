import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ParticipantItem } from '@/features/events/types/events';
import { AppList } from '@/shared/ui/AppList';
import { PersonListRow } from '@/features/people/components/PersonListRow';
import { formatCurrencyAmount } from '@/shared/utils/money';
import { eventDetailsStyles as styles } from '@/features/events/components/event-details/styles';
import { isCurrentUserPerson, sortPeopleWithCurrentUserFirst } from '@/shared/utils/people';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useSelectionListMode } from '@/shared/hooks/useSelectionListMode';
import { SelectionDeleteConfirm } from '@/shared/ui/SelectionDeleteConfirm';

export type PeopleSelectionToolbarState = {
  visible: boolean;
  title: string;
  totalSelectableCount: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onDelete: () => void;
  onClose: () => void;
};

type PeoplePanelProps = {
  participants: ParticipantItem[];
  participantBalanceMap: Map<string, number>;
  currencyCode: string;
  onRemoveParticipants: (participantIds: string[]) => void;
  onSelectionToolbarChange?: (state: PeopleSelectionToolbarState | null) => void;
};

export const PeoplePanel = memo(function PeoplePanel({
  participants,
  participantBalanceMap,
  currencyCode,
  onRemoveParticipants,
  onSelectionToolbarChange,
}: PeoplePanelProps) {
  const { t } = useTranslation();
  const { isVisible: isDeleteConfirmVisible, open: openDeleteConfirm, close: closeDeleteConfirm } =
    useConfirmState();

  const sortedParticipants = useMemo(
    () => sortPeopleWithCurrentUserFirst(participants),
    [participants],
  );
  const {
    isEditMode,
    selectedIds,
    selectedSet,
    exitEditMode,
    toggleSelection,
    enterEditMode,
    getToolbarProps,
  } = useSelectionListMode<ParticipantItem>({
    items: sortedParticipants,
    enableBeforeRemoveExit: true,
  });

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }
    onRemoveParticipants(selectedIds);
    closeDeleteConfirm();
    exitEditMode();
  }, [closeDeleteConfirm, exitEditMode, onRemoveParticipants, selectedIds]);

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

  const renderParticipantItem = useCallback(
    ({ item }: { item: ParticipantItem }) => (
      <ParticipantBalanceRow
        participant={item}
        balance={participantBalanceMap.get(item.id) ?? 0}
        currencyCode={currencyCode}
        selectable={isEditMode}
        selected={selectedSet.has(item.id)}
        onPress={isEditMode ? () => toggleSelection(item) : undefined}
        onLongPress={!isEditMode ? () => enterEditMode(item) : undefined}
      />
    ),
    [currencyCode, enterEditMode, isEditMode, participantBalanceMap, selectedSet, toggleSelection],
  );

  if (sortedParticipants.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text variant="titleMedium">{t('events.tabs.addPeopleToEvent')}</Text>
        <Text variant="bodyMedium">{t('events.tabs.startSplittingWithGroup')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.rawListWrapper, styles.peopleSectionSpacing]}>
      <AppList
        data={sortedParticipants}
        keyExtractor={(item) => item.id}
        containerStyle={styles.rawListContainer}
        listStyle={styles.rawList}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        renderItem={({ item }) => renderParticipantItem({ item })}
      />

      <SelectionDeleteConfirm
        visible={isDeleteConfirmVisible}
        title={t('events.removeFromEvent.title')}
        message={t('events.removeFromEvent.message')}
        confirmText={t('events.removeFromEvent.confirm')}
        onDismiss={closeDeleteConfirm}
        onConfirm={handleDeleteSelected}
      />
    </View>
  );
});

type ParticipantBalanceRowProps = {
  participant: ParticipantItem;
  balance: number;
  currencyCode: string;
  selectable: boolean;
  selected: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

const ParticipantBalanceRow = memo(function ParticipantBalanceRow({
  participant,
  balance,
  currencyCode,
  selectable,
  selected,
  onPress,
  onLongPress,
}: ParticipantBalanceRowProps) {
  const theme = useTheme();
  const absoluteBalance = Math.abs(balance);
  const formattedBalance =
    balance > 0
      ? `+${formatCurrencyAmount(currencyCode, absoluteBalance)}`
      : balance < 0
        ? `-${formatCurrencyAmount(currencyCode, absoluteBalance)}`
        : formatCurrencyAmount(currencyCode, 0);

  const balanceStyle = balance > 0
    ? {
        backgroundColor: '#DCFCE7',
        borderColor: theme.colors.outlineVariant,
        color: '#15803D',
      }
    : balance < 0
      ? {
          backgroundColor: theme.colors.errorContainer,
          borderColor: theme.colors.error,
          color: theme.colors.onErrorContainer,
        }
      : {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          color: theme.colors.onSurfaceVariant,
        };

  const balanceChip = (
    <View style={[styles.balancePill, { backgroundColor: balanceStyle.backgroundColor, borderColor: balanceStyle.borderColor }]}>
      <Text variant="labelMedium" style={{ color: balanceStyle.color }}>
        {formattedBalance}
      </Text>
    </View>
  );

  return (
    <PersonListRow
      name={participant.name}
      phone={participant.phone}
      email={participant.email}
      rightSlot={selectable ? undefined : balanceChip}
      selectable={selectable}
      selected={selected}
      isCurrentUser={isCurrentUserPerson(participant)}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
});

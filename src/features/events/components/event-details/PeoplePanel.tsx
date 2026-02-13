import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ParticipantItem } from '../../types/events';
import { AppList } from '../../../../shared/ui/AppList';
import { PersonListRow } from '../../../people/components/PersonListRow';
import { formatCurrencyAmount } from '../../../../shared/utils/currency';
import { eventDetailsStyles as styles } from './styles';
import { isCurrentUserPerson, sortPeopleWithCurrentUserFirst } from '../../../../shared/utils/people';
import { AppConfirm } from '../../../../shared/ui/AppConfirm';
import { useSelectionMode } from '../../../../shared/hooks/useSelectionMode';

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
  const theme = useTheme();
  const navigation = useNavigation();
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const sortedParticipants = useMemo(
    () => sortPeopleWithCurrentUserFirst(participants),
    [participants],
  );
  const {
    isEditMode,
    selectedIds,
    selectedSet,
    selectableIds,
    exitEditMode,
    toggleSelection,
    enterEditMode,
    toggleSelectAll,
  } = useSelectionMode<ParticipantItem>({
    items: sortedParticipants,
  });

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }
    onRemoveParticipants(selectedIds);
    setIsDeleteConfirmVisible(false);
    exitEditMode();
  }, [exitEditMode, onRemoveParticipants, selectedIds]);

  useEffect(() => {
    if (!onSelectionToolbarChange) {
      return;
    }

    onSelectionToolbarChange({
      visible: isEditMode,
      title: `Selected ${selectedIds.length}`,
      totalSelectableCount: selectableIds.length,
      selectedCount: selectedIds.length,
      onToggleSelectAll: toggleSelectAll,
      onDelete: () => setIsDeleteConfirmVisible(true),
      onClose: exitEditMode,
    });

    return () => {
      onSelectionToolbarChange(null);
    };
  }, [
    exitEditMode,
    isEditMode,
    onSelectionToolbarChange,
    selectableIds.length,
    selectedIds.length,
    toggleSelectAll,
  ]);

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
      return () => {
        subscription.remove();
      };
    }, [exitEditMode, isEditMode]),
  );

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (event) => {
        if (!isEditMode) {
          return;
        }
        event.preventDefault();
        exitEditMode();
      });
      return unsubscribe;
    }, [exitEditMode, isEditMode, navigation]),
  );

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
        <Text variant="titleMedium">No people in this event</Text>
        <Text variant="bodyMedium">Add people to start splitting expenses.</Text>
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

      <AppConfirm
        visible={isDeleteConfirmVisible}
        title="Remove from event"
        onDismiss={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleDeleteSelected}
        confirmText="Remove"
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Selected contacts will be removed from this event.
        </Text>
      </AppConfirm>
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
        backgroundColor: 'rgba(22, 163, 74, 0.16)',
        borderColor: '#4ADE80',
        color: '#16A34A',
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

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PoolItem } from '@/features/events/types/events';
import { AppList } from '@/shared/ui/AppList';
import { formatCurrencyAmount } from '@/shared/utils/money';
import { eventDetailsStyles as styles } from '@/features/events/components/event-details/styles';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useSelectionListMode } from '@/shared/hooks/useSelectionListMode';
import { SelectionDeleteConfirm } from '@/shared/ui/SelectionDeleteConfirm';
import { PersonListRow } from '@/features/people/components/PersonListRow';

export type PoolsSelectionToolbarState = {
  visible: boolean;
  title: string;
  totalSelectableCount: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onDelete: () => void;
  onClose: () => void;
};

type PoolsPanelProps = {
  pools: PoolItem[];
  poolBalanceMap: Map<string, number>;
  currencyCode: string;
  onRemovePools: (poolIds: string[]) => void;
  onPressPool: (poolId: string) => void;
  onTopUpPool: (poolId: string) => void;
  onSelectionToolbarChange?: (state: PoolsSelectionToolbarState | null) => void;
};

export const PoolsPanel = memo(function PoolsPanel({
  pools,
  poolBalanceMap,
  currencyCode,
  onRemovePools,
  onPressPool,
  onTopUpPool,
  onSelectionToolbarChange,
}: PoolsPanelProps) {
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
  } = useSelectionListMode<PoolItem>({
    items: pools,
    enableBeforeRemoveExit: true,
  });

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }
    onRemovePools(selectedIds);
    closeDeleteConfirm();
    exitEditMode();
  }, [closeDeleteConfirm, exitEditMode, onRemovePools, selectedIds]);

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
  }, [getToolbarProps, isEditMode, openDeleteConfirm, onSelectionToolbarChange]);

  const renderPoolItem = useCallback(
    ({ item }: { item: PoolItem }) => {
      const balance = poolBalanceMap.get(item.id) ?? 0;
      return (
        <PoolBalanceRow
          pool={item}
          balance={balance}
          currencyCode={currencyCode}
          selectable={isEditMode}
          selected={selectedSet.has(item.id)}
          onPress={isEditMode ? () => toggleSelection(item) : () => onPressPool(item.id)}
          onAdd={!isEditMode ? () => onTopUpPool(item.id) : undefined}
          onLongPress={!isEditMode ? () => enterEditMode(item) : undefined}
        />
      );
    },
    [currencyCode, enterEditMode, isEditMode, onPressPool, onTopUpPool, poolBalanceMap, selectedSet, toggleSelection],
  );

  if (pools.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text variant="titleMedium">{t('events.pools.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.rawListWrapper, styles.peopleSectionSpacing]}>
      <AppList
        data={pools}
        keyExtractor={(item) => item.id}
        containerStyle={styles.rawListContainer}
        listStyle={styles.rawList}
        renderItem={({ item }) => renderPoolItem({ item })}
      />

      <SelectionDeleteConfirm
        visible={isDeleteConfirmVisible}
        title={t('events.pools.deletePool.title')}
        message={t('events.pools.deletePool.message')}
        confirmText={t('common.delete')}
        onDismiss={closeDeleteConfirm}
        onConfirm={handleDeleteSelected}
      />
    </View>
  );
});

type PoolBalanceRowProps = {
  pool: PoolItem;
  balance: number;
  currencyCode: string;
  selectable: boolean;
  selected: boolean;
  onPress?: () => void;
  onAdd?: () => void;
  onLongPress?: () => void;
};

const PoolBalanceRow = memo(function PoolBalanceRow({
  pool,
  balance,
  currencyCode,
  selectable,
  selected,
  onPress,
  onAdd,
  onLongPress,
}: PoolBalanceRowProps) {
  const theme = useTheme();
  const formattedBalance = formatCurrencyAmount(currencyCode, Math.abs(balance));
  
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
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={[styles.balancePill, { backgroundColor: balanceStyle.backgroundColor, borderColor: balanceStyle.borderColor }]}>
        <Text variant="labelMedium" style={{ color: balanceStyle.color }}>
          {balance > 0 ? '+' : balance < 0 ? '-' : ''}{formattedBalance}
        </Text>
      </View>
      {onAdd && (
        <IconButton
          icon="plus-circle-outline"
          size={24}
          onPress={onAdd}
          iconColor={theme.colors.primary}
          style={{ marginLeft: 4, marginRight: -8 }}
        />
      )}
    </View>
  );

  return (
    <PersonListRow
      name={pool.name}
      rightSlot={selectable ? undefined : balanceChip}
      selectable={selectable}
      selected={selected}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
});

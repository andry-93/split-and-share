import { BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectionMode } from '@/shared/hooks/useSelectionMode';

type SelectionItem = {
  id: string;
};

type UseSelectionListModeParams<TItem extends SelectionItem> = {
  items: TItem[];
  canSelect?: (item: TItem) => boolean;
  enableBeforeRemoveExit?: boolean;
};

export function useSelectionListMode<TItem extends SelectionItem>({
  items,
  canSelect,
  enableBeforeRemoveExit = false,
}: UseSelectionListModeParams<TItem>) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    isEditMode,
    selectedIds,
    selectableIds,
    toggleSelectAll,
    exitEditMode,
    ...selectionRest
  } = useSelectionMode<TItem>({ items, canSelect });

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
      if (!enableBeforeRemoveExit) {
        return () => {};
      }

      const unsubscribe = navigation.addListener('beforeRemove', (event) => {
        if (!isEditMode) {
          return;
        }
        event.preventDefault();
        exitEditMode();
      });
      return unsubscribe;
    }, [enableBeforeRemoveExit, exitEditMode, isEditMode, navigation]),
  );

  const getToolbarProps = useCallback(
    (onDelete: () => void) => ({
      title: t('common.selectedCount', { count: selectedIds.length }),
      totalSelectableCount: selectableIds.length,
      selectedCount: selectedIds.length,
      onToggleSelectAll: toggleSelectAll,
      onDelete,
      onClose: exitEditMode,
    }),
    [t, selectedIds.length, selectableIds.length, toggleSelectAll, exitEditMode],
  );

  return {
    ...selectionRest,
    isEditMode,
    selectedIds,
    selectableIds,
    toggleSelectAll,
    exitEditMode,
    getToolbarProps,
  };
}

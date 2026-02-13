import { useCallback, useMemo, useState } from 'react';

type SelectionItem = {
  id: string;
};

type UseSelectionModeParams<TItem extends SelectionItem> = {
  items: TItem[];
  canSelect?: (item: TItem) => boolean;
};

export function useSelectionMode<TItem extends SelectionItem>({
  items,
  canSelect,
}: UseSelectionModeParams<TItem>) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelectable = useCallback(
    (item: TItem) => (canSelect ? canSelect(item) : true),
    [canSelect],
  );

  const selectableIds = useMemo(
    () => items.filter((item) => isSelectable(item)).map((item) => item.id),
    [isSelectable, items],
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setSelectedIds([]);
  }, []);

  const toggleSelection = useCallback(
    (item: TItem) => {
      if (!isSelectable(item)) {
        return;
      }
      setSelectedIds((prev) =>
        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
      );
    },
    [isSelectable],
  );

  const enterEditMode = useCallback(
    (item: TItem) => {
      if (!isSelectable(item)) {
        return;
      }
      setIsEditMode(true);
      setSelectedIds([item.id]);
    },
    [isSelectable],
  );

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === selectableIds.length ? [] : selectableIds));
  }, [selectableIds]);

  return {
    isEditMode,
    selectedIds,
    selectedSet,
    selectableIds,
    exitEditMode,
    toggleSelection,
    enterEditMode,
    toggleSelectAll,
    setSelectedIds,
    setIsEditMode,
  };
}

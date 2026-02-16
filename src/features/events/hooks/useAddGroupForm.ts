import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';

type UseAddGroupFormInput = {
  groupId?: string;
  onSaved: () => void;
};

export function useAddGroupForm({ groupId, onSaved }: UseAddGroupFormInput) {
  const { groups } = useEventsState();
  const { createGroup, updateGroup } = useEventsActions();
  const editingGroup = useMemo(
    () => (groupId ? groups.find((group) => group.id === groupId) : undefined),
    [groupId, groups],
  );

  const [name, setName] = useState(editingGroup?.name ?? '');
  const [description, setDescription] = useState(editingGroup?.description ?? '');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setName(editingGroup?.name ?? '');
    setDescription(editingGroup?.description ?? '');
  }, [editingGroup]);

  const handleSave = useCallback(() => {
    try {
      if (editingGroup) {
        updateGroup({ groupId: editingGroup.id, name, description });
      } else {
        createGroup({ name, description });
      }
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save group.');
    }
  }, [createGroup, description, editingGroup, name, onSaved, updateGroup]);

  return {
    editingGroup,
    name,
    setName,
    description,
    setDescription,
    errorMessage,
    setErrorMessage,
    handleSave,
  };
}

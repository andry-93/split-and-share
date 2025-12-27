import { RootState } from '@/store';

export const selectLoading = (state: RootState) =>
    state.ui.loading;

export const selectError = (state: RootState) =>
    state.ui.error;

export const selectSelectedParticipantIds = (
    state: RootState
) => state.ui.selectedParticipantIds;

export const selectEditingExpenseId = (
    state: RootState
) => state.ui.editingExpenseId;

export const selectIsExpenseDialogOpen = (
    state: RootState
) => state.ui.isExpenseDialogOpen;

export const selectIsParticipantsDialogOpen = (
    state: RootState
) => state.ui.isParticipantsDialogOpen;

export const selectSelectedEventIds = (state: RootState) =>
    state.ui.selectedEventIds;

export const selectIsEventDialogOpen = (state: RootState) =>
    state.ui.isEventDialogOpen;

export const selectIsConfirmDeleteOpen = (state: RootState) =>
    state.ui.isConfirmDeleteOpen;

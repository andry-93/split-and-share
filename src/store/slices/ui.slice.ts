import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UiState = {
    /* ===== GLOBAL ===== */
    loading: boolean;
    error?: string;

    /* ===== EVENTS UI ===== */
    selectedEventIds: string[];

    /* ===== PARTICIPANTS UI ===== */
    selectedParticipantIds: string[];

    /* ===== EXPENSES UI ===== */
    editingExpenseId?: string | null;

    /* ===== DIALOGS ===== */
    isEventDialogOpen: boolean;
    isExpenseDialogOpen: boolean;
    isParticipantsDialogOpen: boolean;
    isConfirmDeleteOpen: boolean;
};

const initialState: UiState = {
    loading: false,
    error: undefined,

    selectedEventIds: [],
    selectedParticipantIds: [],

    editingExpenseId: null,

    isEventDialogOpen: false,
    isExpenseDialogOpen: false,
    isParticipantsDialogOpen: false,
    isConfirmDeleteOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        /* ===== GLOBAL ===== */
        setLoading(
            state,
            action: PayloadAction<boolean>
        ) {
            state.loading = action.payload;
        },

        setError(
            state,
            action: PayloadAction<string | undefined>
        ) {
            state.error = action.payload;
        },

        /* ===== EVENTS ===== */
        setSelectedEventIds(
            state,
            action: PayloadAction<string[]>
        ) {
            state.selectedEventIds = action.payload;
        },

        clearSelectedEvents(state) {
            state.selectedEventIds = [];
        },

        /* ===== PARTICIPANTS ===== */
        setSelectedParticipantIds(
            state,
            action: PayloadAction<string[]>
        ) {
            state.selectedParticipantIds =
                action.payload;
        },

        clearSelectedParticipants(state) {
            state.selectedParticipantIds = [];
        },

        /* ===== EXPENSES ===== */
        setEditingExpenseId(
            state,
            action: PayloadAction<string | null>
        ) {
            state.editingExpenseId = action.payload;
        },

        /* ===== DIALOGS ===== */
        openEventDialog(state) {
            state.isEventDialogOpen = true;
        },

        closeEventDialog(state) {
            state.isEventDialogOpen = false;
        },

        openExpenseDialog(state) {
            state.isExpenseDialogOpen = true;
        },

        closeExpenseDialog(state) {
            state.isExpenseDialogOpen = false;
        },

        openParticipantsDialog(state) {
            state.isParticipantsDialogOpen = true;
        },

        closeParticipantsDialog(state) {
            state.isParticipantsDialogOpen = false;
        },

        openConfirmDelete(state) {
            state.isConfirmDeleteOpen = true;
        },
        closeConfirmDelete(state) {
            state.isConfirmDeleteOpen = false;
        },
    },
});

export const {
    setLoading,
    setError,

    setSelectedEventIds,
    clearSelectedEvents,

    setSelectedParticipantIds,
    clearSelectedParticipants,

    setEditingExpenseId,

    openEventDialog,
    closeEventDialog,

    openExpenseDialog,
    closeExpenseDialog,

    openParticipantsDialog,
    closeParticipantsDialog,

    openConfirmDelete,
    closeConfirmDelete
} = uiSlice.actions;

export default uiSlice.reducer;

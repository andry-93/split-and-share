import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type EventsSort =
    | 'created_desc'
    | 'created_asc'
    | 'title_asc'
    | 'title_desc';

export type ParticipantsSort =
    | 'name_asc'
    | 'name_desc';


type UiState = {
    /* ===== GLOBAL ===== */
    loading: boolean;
    error?: string;

    /* ===== EVENTS UI ===== */
    selectedEventIds: string[];
    eventsSearch: string;
    eventsSort: EventsSort;
    eventsFilterHasExpenses: boolean;
    eventsSearchVisible: boolean;

    /* ===== PARTICIPANTS UI ===== */
    selectedParticipantIds: string[];
    participantsSearch: string;
    participantsSort: ParticipantsSort;
    participantsSearchVisible: boolean;

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
    eventsSearch: '',
    participantsSearch: '',
    eventsSort: 'created_desc',
    eventsFilterHasExpenses: false,
    participantsSort: 'name_asc',
    editingExpenseId: null,
    eventsSearchVisible: false,
    participantsSearchVisible: false,
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

        setEventsSort(
            state,
            action: PayloadAction<EventsSort>
        ) {
            state.eventsSort = action.payload;
        },

        toggleEventsFilterHasExpenses(state) {
            state.eventsFilterHasExpenses =
                !state.eventsFilterHasExpenses;
        },

        resetEventsFilters(state) {
            state.eventsSort = 'created_desc';
            state.eventsFilterHasExpenses = false;
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

        setParticipantsSort(
            state,
            action: PayloadAction<ParticipantsSort>
        ) {
            state.participantsSort = action.payload;
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

        setEventsSearch(
            state,
            action: PayloadAction<string>
        ) {
            state.eventsSearch = action.payload;
        },

        clearEventsSearch(state) {
            state.eventsSearch = '';
        },

        setParticipantsSearch(
            state,
            action: PayloadAction<string>
        ) {
            state.participantsSearch = action.payload;
        },

        clearParticipantsSearch(state) {
            state.participantsSearch = '';
        },

        showEventsSearch(state) {
            state.eventsSearchVisible = true;
        },

        hideEventsSearch(state) {
            state.eventsSearchVisible = false;
        },

        showParticipantsSearch(state) {
            state.participantsSearchVisible = true;
        },

        hideParticipantsSearch(state) {
            state.participantsSearchVisible = false;
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
    closeConfirmDelete,

    setEventsSearch,
    clearEventsSearch,

    setParticipantsSearch,
    clearParticipantsSearch,

    setEventsSort,
    toggleEventsFilterHasExpenses,
    resetEventsFilters,

    setParticipantsSort,

    showEventsSearch,
    hideEventsSearch,
    showParticipantsSearch,
    hideParticipantsSearch
} = uiSlice.actions;

export default uiSlice.reducer;

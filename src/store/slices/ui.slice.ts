import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ActiveDialog = 'event' | 'participant' | null;

export type UIState = {
    bottomSheetOpen: boolean;
    activeDialog: ActiveDialog;
};

const initialState: UIState = {
    bottomSheetOpen: false,
    activeDialog: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openBottomSheet(state) {
            state.bottomSheetOpen = true;
        },
        closeBottomSheet(state) {
            state.bottomSheetOpen = false;
        },
        openDialog(state, action: PayloadAction<ActiveDialog>) {
            state.activeDialog = action.payload;
        },
        closeDialog(state) {
            state.activeDialog = null;
        },
    },
});

export const {
    openBottomSheet,
    closeBottomSheet,
    openDialog,
    closeDialog,
} = uiSlice.actions;

export default uiSlice.reducer;

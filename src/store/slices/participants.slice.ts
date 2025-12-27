import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Participant } from '@/entities/types';

type ParticipantsState = {
    list: Participant[];
};

const initialState: ParticipantsState = {
    list: [],
};

const participantsSlice = createSlice({
    name: 'participants',
    initialState,
    reducers: {
        setParticipants(
            state,
            action: PayloadAction<Participant[]>
        ) {
            state.list = action.payload;
        },

        addParticipant(
            state,
            action: PayloadAction<Participant>
        ) {
            state.list.push(action.payload);
        },

        updateParticipant(
            state,
            action: PayloadAction<{
                id: string;
                changes: Partial<Participant>;
            }>
        ) {
            const index = state.list.findIndex(
                p => p.id === action.payload.id
            );
            if (index === -1) return;

            state.list[index] = {
                ...state.list[index],
                ...action.payload.changes,
            };
        },

        removeParticipant(
            state,
            action: PayloadAction<string>
        ) {
            state.list = state.list.filter(
                p => p.id !== action.payload
            );
        },
    },
});

export const {
    setParticipants,
    addParticipant,
    updateParticipant,
    removeParticipant,
} = participantsSlice.actions;

export default participantsSlice.reducer;

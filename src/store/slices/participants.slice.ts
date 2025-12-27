import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Participant } from '../../entities/types';

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
        addParticipant(state, action: PayloadAction<Participant>) {
            state.list.push(action.payload);
        },

        updateParticipant(
            state,
            action: PayloadAction<{
                id: string;
                name?: string;
                color?: string;
            }>
        ) {
            const participant = state.list.find(
                p => p.id === action.payload.id
            );

            if (!participant) return;

            if (action.payload.name !== undefined) {
                participant.name = action.payload.name;
            }

            if (action.payload.color !== undefined) {
                participant.color = action.payload.color;
            }
        },

        removeParticipant(state, action: PayloadAction<string>) {
            state.list = state.list.filter(
                p => p.id !== action.payload
            );
        },

        removeParticipantsByEvent(
            state,
            action: PayloadAction<string>
        ) {
            state.list = state.list.filter(
                p => p.eventId !== action.payload
            );
        },
    },
});

export const {
    addParticipant,
    updateParticipant,
    removeParticipant,
    removeParticipantsByEvent,
} = participantsSlice.actions;

export default participantsSlice.reducer;

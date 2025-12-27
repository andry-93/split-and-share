import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event } from '@/entities/types';

type EventsState = {
    list: Event[];
    activeEventId: string | null;
};

const initialState: EventsState = {
    list: [],
    activeEventId: null,
};

const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        addEvent(state, action: PayloadAction<Event>) {
            state.list.push(action.payload);
        },

        removeEvent(state, action: PayloadAction<string>) {
            state.list = state.list.filter(
                e => e.id !== action.payload
            );

            if (state.activeEventId === action.payload) {
                state.activeEventId = null;
            }
        },

        updateEvent(
            state,
            action: PayloadAction<{
                id: string;
                changes: Partial<Event>;
            }>
        ) {
            const index = state.list.findIndex(
                e => e.id === action.payload.id
            );

            if (index === -1) return;

            state.list[index] = {
                ...state.list[index],
                ...action.payload.changes,
            };
        },

        setEvents(state, action: PayloadAction<Event[]>) {
            state.list = action.payload;
        },

        setActiveEvent(state, action: PayloadAction<string | null>) {
            state.activeEventId = action.payload;
        },
    },
});

export const {
    addEvent,
    removeEvent,
    updateEvent,
    setEvents,
    setActiveEvent,
} = eventsSlice.actions;

export default eventsSlice.reducer;

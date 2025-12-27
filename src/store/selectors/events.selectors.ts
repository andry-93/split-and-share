import { RootState } from '@/store';

export const selectEvents = (state: RootState) =>
    state.events.list;

export const selectActiveEventId = (state: RootState) =>
    state.events.activeEventId;

export const selectActiveEvent = (state: RootState) => {
    const id = selectActiveEventId(state);
    return state.events.list.find(e => e.id === id) ?? null;
};

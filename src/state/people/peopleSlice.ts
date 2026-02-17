import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createDefaultPeopleState } from '@/state/defaultState';
import {
  AddManyPayload,
  AddPersonPayload,
  RemoveManyPayload,
  UpdatePersonPayload,
} from '@/state/people/peopleActionTypes';

export const peopleSlice = createSlice({
  name: 'people',
  initialState: createDefaultPeopleState(),
  reducers: {
    addPerson: (state, action: PayloadAction<AddPersonPayload>) => {
      const { id, name, phone, email, note, isMe } = action.payload;
      state.people.unshift({
        id,
        name,
        phone,
        email,
        note,
        isMe,
      });
    },
    updatePerson: (state, action: PayloadAction<UpdatePersonPayload>) => {
      const { id, name, phone, email, note } = action.payload;
      state.people = state.people.map((person) =>
        person.id === id
          ? {
              ...person,
              name,
              phone,
              email,
              note,
            }
          : person,
      );
    },
    addMany: (state, action: PayloadAction<AddManyPayload>) => {
      const existing = new Set(
        state.people.map(
          (person) =>
            `${person.name.toLowerCase()}|${person.phone?.toLowerCase() ?? ''}|${person.email?.toLowerCase() ?? ''}`,
        ),
      );
      const nextPeople = action.payload.people.filter((person) => {
        const key = `${person.name.toLowerCase()}|${person.phone?.toLowerCase() ?? ''}|${person.email?.toLowerCase() ?? ''}`;
        if (existing.has(key)) {
          return false;
        }
        existing.add(key);
        return true;
      });

      state.people = [...nextPeople, ...state.people];
    },
    removeMany: (state, action: PayloadAction<RemoveManyPayload>) => {
      const idsToRemove = new Set(action.payload.ids);
      state.people = state.people.filter((person) => !idsToRemove.has(person.id));
    },
  },
});

export const peopleActions = peopleSlice.actions;

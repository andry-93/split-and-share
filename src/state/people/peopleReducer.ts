import { PeopleAction, PeopleState } from './peopleTypes';

export function peopleReducer(state: PeopleState, action: PeopleAction): PeopleState {
  switch (action.type) {
    case 'people/add': {
      const { id, name, contact, note, isMe } = action.payload;
      return {
        ...state,
        people: [
          {
            id,
            name,
            contact,
            note,
            isMe,
          },
          ...state.people,
        ],
      };
    }
    case 'people/update': {
      const { id, name, contact, note } = action.payload;
      return {
        ...state,
        people: state.people.map((person) =>
          person.id === id
            ? {
                ...person,
                name,
                contact,
                note,
              }
            : person,
        ),
      };
    }
    case 'people/addMany': {
      const existing = new Set(
        state.people.map((person) => `${person.name.toLowerCase()}|${person.contact ?? ''}`),
      );
      const nextPeople = action.payload.people.filter((person) => {
        const key = `${person.name.toLowerCase()}|${person.contact ?? ''}`;
        if (existing.has(key)) {
          return false;
        }
        existing.add(key);
        return true;
      });

      return {
        ...state,
        people: [...nextPeople, ...state.people],
      };
    }
    default:
      return state;
  }
}

import { PeopleAction, PeopleState } from './peopleTypes';

export function peopleReducer(state: PeopleState, action: PeopleAction): PeopleState {
  switch (action.type) {
    case 'people/add': {
      const { id, name, phone, email, note, isMe } = action.payload;
      return {
        ...state,
        people: [
          {
            id,
            name,
            phone,
            email,
            note,
            isMe,
          },
          ...state.people,
        ],
      };
    }
    case 'people/update': {
      const { id, name, phone, email, note } = action.payload;
      return {
        ...state,
        people: state.people.map((person) =>
          person.id === id
            ? {
                ...person,
                name,
                phone,
                email,
                note,
              }
            : person,
        ),
      };
    }
    case 'people/addMany': {
      const existing = new Set(
        state.people.map(
          (person) => `${person.name.toLowerCase()}|${person.phone?.toLowerCase() ?? ''}|${person.email?.toLowerCase() ?? ''}`,
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

      return {
        ...state,
        people: [...nextPeople, ...state.people],
      };
    }
    case 'people/removeMany': {
      const idsToRemove = new Set(action.payload.ids);
      return {
        ...state,
        people: state.people.filter((person) => !idsToRemove.has(person.id)),
      };
    }
    default:
      return state;
  }
}

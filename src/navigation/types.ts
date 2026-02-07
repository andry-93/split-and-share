export type EventsStackParamList = {
  Events: undefined;
  AddEvent: undefined;
  EventDetails: { eventId: string };
  AddExpense: { eventId: string };
  AddPeopleToEvent: { eventId: string };
};

export type PeopleStackParamList = {
  People: undefined;
  AddPerson: undefined;
  ImportContactsAccess: undefined;
  ImportContactsPicker: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type RootTabParamList = {
  EventsTab: undefined;
  PeopleTab: undefined;
  ProfileTab: undefined;
};

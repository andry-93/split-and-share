export type EventsStackParamList = {
  Events: undefined;
  AddEvent: { eventId?: string } | undefined;
  EventDetails: { eventId: string };
  AddExpense: { eventId: string; expenseId?: string } | undefined;
  AddPeopleToEvent: { eventId: string };
};

export type PeopleStackParamList = {
  People: undefined;
  AddPerson: { personId?: string } | undefined;
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

export type EventsStackParamList = {
  Events: { groupId?: string } | undefined;
  AddEvent: { eventId?: string; groupId?: string } | undefined;
  AddGroup: { groupId?: string } | undefined;
  EventDetails: { eventId: string };
  EventReportPreview: { eventId: string };
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

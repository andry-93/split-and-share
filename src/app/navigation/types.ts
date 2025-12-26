export type RootTabParamList = {
    EventsTab: undefined;
    ParticipantsTab: undefined;
    SettingsTab: undefined;
};

export type EventsStackParamList = {
    EventsList: undefined;
    EventDetails: { eventId: string };
};

export type ParticipantsStackParamList = {
    ParticipantsList: undefined;
    ParticipantEdit: { participantId?: string };
};

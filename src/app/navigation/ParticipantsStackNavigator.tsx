import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParticipantsScreen } from '@/features/participants/ParticipantsScreen';
import { ParticipantEditScreen } from '@/features/participants/ParticipantEditScreen';

export type ParticipantsStackParamList = {
    ParticipantsList: undefined;
    ParticipantEdit: { participantId?: string };
};

const Stack =
    createNativeStackNavigator<ParticipantsStackParamList>();

export const ParticipantsStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="ParticipantsList"
                component={ParticipantsScreen}
            />
            <Stack.Screen
                name="ParticipantEdit"
                component={ParticipantEditScreen}
            />
        </Stack.Navigator>
    );
};

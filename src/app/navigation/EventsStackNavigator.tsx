import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EventsScreen } from '@/features/events/EventsScreen';
import { EventDetailsScreen } from '@/features/events/EventDetailsScreen';
import {EventsStackParamList} from "./types";

const Stack =
    createNativeStackNavigator<EventsStackParamList>();

export const EventsStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // используем кастомный AppBar через Screen
            }}
        >
            <Stack.Screen
                name="EventsList"
                component={EventsScreen}
            />
            <Stack.Screen
                name="EventDetails"
                component={EventDetailsScreen}
            />
        </Stack.Navigator>
    );
};

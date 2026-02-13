import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from '@/navigation/types';
import { EventsListScreen } from '@/features/events/screens/EventsListScreen';
import { AddEventScreen } from '@/features/events/screens/AddEventScreen';
import { EventDetailsScreen } from '@/features/events/screens/EventDetailsScreen';
import { AddExpenseScreen } from '@/features/events/screens/AddExpenseScreen';
import { AddPeopleToEventScreen } from '@/features/events/screens/AddPeopleToEventScreen';
const Stack = createNativeStackNavigator<EventsStackParamList>();

export function EventsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Events" component={EventsListScreen} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="AddPeopleToEvent" component={AddPeopleToEventScreen} />
    </Stack.Navigator>
  );
}

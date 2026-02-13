import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '@/navigation/types';
import { PeopleListScreen } from '@/features/people/screens/PeopleListScreen';
import { AddPersonScreen } from '@/features/people/screens/AddPersonScreen';
import { ContactsAccessScreen } from '@/features/people/screens/ContactsAccessScreen';
import { ContactsPickerScreen } from '@/features/people/screens/ContactsPickerScreen';

const Stack = createNativeStackNavigator<PeopleStackParamList>();

export function PeopleStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="People" component={PeopleListScreen} />
      <Stack.Screen name="AddPerson" component={AddPersonScreen} />
      <Stack.Screen name="ImportContactsAccess" component={ContactsAccessScreen} />
      <Stack.Screen name="ImportContactsPicker" component={ContactsPickerScreen} />
    </Stack.Navigator>
  );
}

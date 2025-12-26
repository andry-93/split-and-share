import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootTabParamList } from './types';
import { EventsStackNavigator } from './EventsStackNavigator';
import { SettingsScreen } from '../../features/settings/SettingsScreen';
import {ParticipantsStackNavigator} from "./ParticipantsStackNavigator";

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="EventsTab"
        component={EventsStackNavigator}
        options={{
          tabBarLabel: t('events'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ParticipantsTab"
        component={ParticipantsStackNavigator}
        options={{
          tabBarLabel: t('participants'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootTabParamList } from './types';
import { EventsStackNavigator } from './stacks/EventsStackNavigator';
import { PeopleStackNavigator } from './stacks/PeopleStackNavigator';
import { ProfileStackNavigator } from './stacks/ProfileStackNavigator';

const Tab = createBottomTabNavigator<RootTabParamList>();

const hiddenTabRoutes = new Set([
  'AddEvent',
  'AddExpense',
  'AddPeopleToEvent',
  'AddPerson',
  'ImportContactsAccess',
  'ImportContactsPicker',
]);

function getTabBarDisplay(route: { name?: string } | undefined) {
  if (!route) {
    return 'flex';
  }

  const routeName = getFocusedRouteNameFromRoute(route as never);
  if (routeName && hiddenTabRoutes.has(routeName)) {
    return 'none';
  }

  return 'flex';
}

export function AppNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'EventsTab'
              ? 'calendar-blank'
              : route.name === 'PeopleTab'
                ? 'account-group'
                : 'cog';

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="EventsTab"
        options={({ route }) => ({
          title: 'Events',
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            display: getTabBarDisplay(route),
          },
        })}
      >
        {() => <EventsStackNavigator />}
      </Tab.Screen>
      <Tab.Screen
        name="PeopleTab"
        options={({ route }) => ({
          title: 'People',
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            display: getTabBarDisplay(route),
          },
        })}
      >
        {() => <PeopleStackNavigator />}
      </Tab.Screen>
      <Tab.Screen
        name="ProfileTab"
        options={{
          title: 'Profile',
        }}
      >
        {() => <ProfileStackNavigator />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

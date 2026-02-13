import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootTabParamList } from '@/navigation/types';
import { EventsStackNavigator } from '@/navigation/stacks/EventsStackNavigator';
import { PeopleStackNavigator } from '@/navigation/stacks/PeopleStackNavigator';
import { ProfileStackNavigator } from '@/navigation/stacks/ProfileStackNavigator';

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
  const baseTabBarStyle = {
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  } as const;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'shift',
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: baseTabBarStyle,
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
            ...baseTabBarStyle,
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
            ...baseTabBarStyle,
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

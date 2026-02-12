import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { eventDetailsStyles as styles } from './styles';

export type EventDetailsTab = 'expenses' | 'debts' | 'people';

type TopTabsProps = {
  activeTab: EventDetailsTab;
  onTabChange: (tab: EventDetailsTab) => void;
};

export const TopTabs = memo(function TopTabs({ activeTab, onTabChange }: TopTabsProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.topTabBar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <TabButton
        label="Expenses"
        value="expenses"
        activeTab={activeTab}
        onPress={onTabChange}
      />
      <TabButton
        label="Debts"
        value="debts"
        activeTab={activeTab}
        onPress={onTabChange}
      />
      <TabButton
        label="People"
        value="people"
        activeTab={activeTab}
        onPress={onTabChange}
      />
    </View>
  );
});

type TabButtonProps = {
  label: string;
  value: EventDetailsTab;
  activeTab: EventDetailsTab;
  onPress: (tab: EventDetailsTab) => void;
};

const TabButton = memo(function TabButton({ label, value, activeTab, onPress }: TabButtonProps) {
  const theme = useTheme();
  const isActive = activeTab === value;

  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[styles.topTabItem, isActive ? { borderBottomColor: theme.colors.primary } : null]}
    >
      <Text
        variant="titleMedium"
        style={[
          styles.topTabLabel,
          { color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
});


import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { eventDetailsStyles as styles } from '@/features/events/components/event-details/styles';

export type EventDetailsTab = 'expenses' | 'debts' | 'people';

type TopTabsProps = {
  activeTab: EventDetailsTab;
  onTabChange: (tab: EventDetailsTab) => void;
};

export const TopTabs = memo(function TopTabs({ activeTab, onTabChange }: TopTabsProps) {
  const { t } = useTranslation();
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
        label={t('events.tabs.expenses')}
        value="expenses"
        activeTab={activeTab}
        onPress={onTabChange}
      />
      <TabButton
        label={t('events.tabs.debts')}
        value="debts"
        activeTab={activeTab}
        onPress={onTabChange}
      />
      <TabButton
        label={t('events.tabs.people')}
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

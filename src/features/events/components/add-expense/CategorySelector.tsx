import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { addExpenseStyles as styles } from '@/features/events/components/add-expense/styles';
import i18n from '@/shared/i18n';

export const categoryOptions = [
  { id: 'food', labelKey: 'events.categories.food', icon: 'cart-outline' },
  { id: 'transport', labelKey: 'events.categories.transport', icon: 'car-outline' },
  { id: 'lodging', labelKey: 'events.categories.lodging', icon: 'home-outline' },
  { id: 'other', labelKey: 'events.categories.other', icon: 'dots-horizontal' },
] as const;

export type CategoryId = (typeof categoryOptions)[number]['id'];

type CategorySelectorProps = {
  value: CategoryId;
  onChange: (value: CategoryId) => void;
};

export const CategorySelector = memo(function CategorySelector({
  value,
  onChange,
}: CategorySelectorProps) {
  const theme = useTheme();

  return (
    <>
      <Text variant="labelLarge" style={styles.sectionLabel}>
        {i18n.t('events.category')}
      </Text>
      <View style={styles.categoryRow}>
        {categoryOptions.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: value === item.id ? theme.colors.primary : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Icon
              source={item.icon}
              size={20}
              color={value === item.id ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelMedium"
              style={{
                color: value === item.id ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
              }}
            >
              {i18n.t(item.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
});

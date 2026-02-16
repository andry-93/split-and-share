import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addEventStyles as styles } from '@/features/events/components/add-event/styles';

type GroupFieldProps = {
  value: string;
  onPress: () => void;
};

export const GroupField = memo(function GroupField({ value, onPress }: GroupFieldProps) {
  const theme = useTheme();

  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        Group
      </Text>
      <OutlinedFieldContainer style={styles.selectFieldContainer}>
        <Pressable onPress={onPress} style={styles.selectField}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {value}
          </Text>
          <Icon source="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
        </Pressable>
      </OutlinedFieldContainer>
    </>
  );
});

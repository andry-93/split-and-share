import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addEventStyles as styles } from '@/features/events/components/add-event/styles';

type DateFieldProps = {
  value: string;
  hasValue: boolean;
  onPress: () => void;
};

export const DateField = memo(function DateField({ value, hasValue, onPress }: DateFieldProps) {
  const theme = useTheme();

  return (
    <>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        Date
      </Text>
      <OutlinedFieldContainer style={styles.selectFieldContainer}>
        <Pressable onPress={onPress} style={styles.selectField}>
          <Text
            variant="titleMedium"
            style={{ color: hasValue ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}
          >
            {value}
          </Text>
          <View style={styles.dateIcons}>
            <Icon source="calendar-blank-outline" size={18} color={theme.colors.onSurfaceVariant} />
          </View>
        </Pressable>
      </OutlinedFieldContainer>
    </>
  );
});

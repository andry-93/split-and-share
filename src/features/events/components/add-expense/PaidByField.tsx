import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { OutlinedFieldContainer } from '../../../../shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from './styles';

type PaidByFieldProps = {
  paidBy: string;
  onPress: () => void;
};

export const PaidByField = memo(function PaidByField({ paidBy, onPress }: PaidByFieldProps) {
  const theme = useTheme();

  return (
    <OutlinedFieldContainer>
      <Pressable onPress={onPress} style={styles.selectField}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {paidBy}
        </Text>
        <Icon source="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
      </Pressable>
    </OutlinedFieldContainer>
  );
});

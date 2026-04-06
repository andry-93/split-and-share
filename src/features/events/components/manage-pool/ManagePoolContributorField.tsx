import React, { memo } from 'react';
import { View } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from '@/features/events/components/add-expense/styles';

type ManagePoolContributorFieldProps = {
  label: string;
  contributorName: string;
  onPress: () => void;
};

export const ManagePoolContributorField = memo(function ManagePoolContributorField({
  label,
  contributorName,
  onPress,
}: ManagePoolContributorFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="labelLarge" style={styles.sectionLabel}>
        {label}
      </Text>
      <OutlinedFieldContainer style={{ overflow: 'hidden' }}>
        <TouchableRipple onPress={onPress}>
          <View style={styles.selectField}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {contributorName}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </TouchableRipple>
      </OutlinedFieldContainer>
    </View>
  );
});

import React, { memo } from 'react';
import { View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { addExpenseStyles as styles } from './styles';

type BottomActionBarProps = {
  onSave: () => void;
  disabled: boolean;
  bottomInset: number;
};

export const BottomActionBar = memo(function BottomActionBar({
  onSave,
  disabled,
  bottomInset,
}: BottomActionBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: Math.max(bottomInset, 12),
        },
      ]}
    >
      <Button mode="contained" onPress={onSave} disabled={disabled}>
        Save expense
      </Button>
    </View>
  );
});

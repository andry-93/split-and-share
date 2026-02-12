import React, { memo } from 'react';
import { View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { addEventStyles as styles } from './styles';

type BottomActionBarProps = {
  bottomInset: number;
  disabled: boolean;
  onPress: () => void;
};

export const BottomActionBar = memo(function BottomActionBar({
  bottomInset,
  disabled,
  onPress,
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
      <Button mode="contained" onPress={onPress} disabled={disabled}>
        Create event
      </Button>
    </View>
  );
});

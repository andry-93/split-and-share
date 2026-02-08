import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';

type AppHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
};

export function AppHeader({ title, onBackPress, rightSlot }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header statusBarHeight={0} style={{ backgroundColor: theme.colors.background }}>
      {onBackPress ? <Appbar.BackAction onPress={onBackPress} /> : null}
      <Appbar.Content title={title} />
      {rightSlot}
    </Appbar.Header>
  );
}

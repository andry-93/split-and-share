import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { Typography } from './theme/styles';

type AppHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
};

/**
 * Enhanced AppHeader with premium typography and better layout control.
 */
export function AppHeader({ title, onBackPress, rightSlot }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header 
      statusBarHeight={0} 
      style={{ 
        backgroundColor: theme.colors.background,
        elevation: 0, // Flat header for modern look
      }}
    >
      {onBackPress ? (
        <Appbar.BackAction 
          onPress={onBackPress} 
          color={theme.colors.onSurface}
        />
      ) : null}
      <Appbar.Content 
        title={title} 
        titleStyle={{
          fontSize: 20,
          fontWeight: Typography.weights.semiBold as any,
          letterSpacing: Typography.letterSpacing.tight,
          color: theme.colors.onSurface,
        }}
      />
      {rightSlot}
    </Appbar.Header>
  );
}

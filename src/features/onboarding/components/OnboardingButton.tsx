import React from 'react';
import { StyleSheet, TextStyle, ViewStyle, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { PremiumPressable } from '@/shared/ui/PremiumPressable';

interface OnboardingButtonProps {
  label: string;
  onPress: () => void;
  mode?: 'primary' | 'ghost';
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  label,
  onPress,
  mode = 'primary',
  style,
  labelStyle,
}) => {
  const theme = useTheme();
  const isPrimary = mode === 'primary';
  
  // Use theme colors for dynamic dark/light mode support
  const buttonBg = isPrimary 
    ? theme.colors.primary 
    : theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  
  const textColor = isPrimary 
    ? theme.colors.onPrimary 
    : theme.colors.primary;

  return (
    <PremiumPressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: buttonBg },
        !isPrimary && { 
          borderWidth: 1.5, 
          borderColor: theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' 
        },
        style
      ]}
    >
      <Text
        variant="labelLarge"
        style={[
          styles.label,
          { color: textColor },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </PremiumPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  label: {
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 14,
  },
});

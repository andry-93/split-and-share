import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PremiumPressableProps extends PressableProps {
  children: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  scaleOnPress?: boolean;
}

/**
 * A premium pressable component with scale animation and optimized touch response.
 */
export function PremiumPressable({
  children,
  style,
  scaleOnPress = true,
  onPressIn,
  onPressOut,
  ...props
}: PremiumPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = (event: any) => {
    if (scaleOnPress) {
      scale.value = withSpring(0.97, {
        damping: 15,
        stiffness: 300,
      });
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (scaleOnPress) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
    }
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        animatedStyle,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

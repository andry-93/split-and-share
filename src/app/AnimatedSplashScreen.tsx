import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  withSequence,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

import { useAppAppearance } from '@/shared/hooks/useAppAppearance';

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
  const { backgroundColor } = useAppAppearance();
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const startAnimation = useCallback(() => {
    // Hide the native splash screen as soon as we start our animation
    SplashScreen.hideAsync().catch(() => {
      // Ignored
    });

    // Animate scale up and fade out
    opacity.value = withDelay(
      300,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(onAnimationFinish)();
        }
      })
    );

    scale.value = withSequence(
      withTiming(0.9, { duration: 150, easing: Easing.inOut(Easing.ease) }),
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, [opacity, scale, onAnimationFinish]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.Image
        source={require('../../assets/splash-icon.png')}
        style={[styles.image, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

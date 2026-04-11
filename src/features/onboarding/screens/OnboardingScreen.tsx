import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/state/store';
import { store } from '@/state/store';
import { persistSettings } from '@/state/settings/settingsStateInit';
import { settingsActions } from '@/state/settings/settingsSlice';
import { OnboardingLanguageStep } from '../components/OnboardingLanguageStep';
import { OnboardingMeStep } from '../components/OnboardingMeStep';
import { OnboardingCurrencyStep } from '../components/OnboardingCurrencyStep';
import { OnboardingNumberFormatStep } from '../components/OnboardingNumberFormatStep';
import { OnboardingDebtModeStep } from '../components/OnboardingDebtModeStep';
import { OnboardingThemeStep } from '../components/OnboardingThemeStep';

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export const OnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<OnboardingStep>(1);

  const next = () => setStep((s) => (s + 1) as OnboardingStep);
  const back = () => setStep((s) => (s - 1) as OnboardingStep);

  const handleDone = () => {
    dispatch(settingsActions.completeOnboarding());
    const currentState = store.getState();
    persistSettings(currentState.settings);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress Dots - Positioned safely above the content */}
      <View style={[styles.dotsContainer, { top: insets.top + 16 }]}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: step === i ? theme.colors.primary : (theme.dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'),
                width: step === i ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View 
        key={step} 
        entering={FadeIn.duration(400)} 
        exiting={FadeOut.duration(300)}
        layout={Layout.springify()}
        style={styles.stepContainer}
      >
        {step === 1 && <OnboardingLanguageStep onNext={next} />}
        {step === 2 && <OnboardingMeStep onNext={next} onBack={back} />}
        {step === 3 && <OnboardingCurrencyStep onNext={next} onBack={back} />}
        {step === 4 && <OnboardingNumberFormatStep onNext={next} onBack={back} />}
        {step === 5 && <OnboardingDebtModeStep onNext={next} onBack={back} />}
        {step === 6 && <OnboardingThemeStep onDone={handleDone} onBack={back} />}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  dotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
    zIndex: 100,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
});

import { useMemo } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { RootTabParamList } from '@/navigation/types';

type RootTabName = keyof RootTabParamList;

const TAB_ORDER: RootTabName[] = ['EventsTab', 'PeopleTab', 'ProfileTab'];
const HORIZONTAL_THRESHOLD = 64;
const VELOCITY_THRESHOLD = 420;

export function useBottomTabSwipeNavigation(currentTab: RootTabName, enabled = true) {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  return useMemo(() => {
    const navigateTo = (target: RootTabName) => {
      navigation.navigate(target);
    };

    const currentIndex = TAB_ORDER.indexOf(currentTab);

    return Gesture.Pan()
      .enabled(enabled && currentIndex >= 0)
      .activeOffsetX([-24, 24])
      .failOffsetY([-14, 14])
      .onEnd((event) => {
        const { translationX, velocityX } = event;
        const shouldGoNext =
          translationX < -HORIZONTAL_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;
        const shouldGoPrev =
          translationX > HORIZONTAL_THRESHOLD || velocityX > VELOCITY_THRESHOLD;

        if (shouldGoNext && currentIndex < TAB_ORDER.length - 1) {
          runOnJS(navigateTo)(TAB_ORDER[currentIndex + 1]);
          return;
        }

        if (shouldGoPrev && currentIndex > 0) {
          runOnJS(navigateTo)(TAB_ORDER[currentIndex - 1]);
        }
      });
  }, [currentTab, enabled, navigation]);
}

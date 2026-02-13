import React, { PropsWithChildren, memo } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import { RootTabParamList } from '@/navigation/types';
import { useBottomTabSwipeNavigation } from '@/shared/hooks/useBottomTabSwipeNavigation';

type BottomTabSwipeBoundaryProps = PropsWithChildren<{
  currentTab: keyof RootTabParamList;
  enabled?: boolean;
}>;

export const BottomTabSwipeBoundary = memo(function BottomTabSwipeBoundary({
  currentTab,
  enabled = true,
  children,
}: BottomTabSwipeBoundaryProps) {
  const swipeGesture = useBottomTabSwipeNavigation(currentTab, enabled);
  return <GestureDetector gesture={swipeGesture}>{children}</GestureDetector>;
});

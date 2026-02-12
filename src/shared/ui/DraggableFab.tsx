import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, useWindowDimensions } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FAB } from 'react-native-paper';

type DraggableFabProps = {
  icon: string;
  onPress: () => void;
  backgroundColor: string;
  color: string;
  topBoundary?: number;
};

const FAB_SIZE = 56;
const EDGE_PADDING = 16;
const TAP_SLOP = 6;

export function DraggableFab({
  icon,
  onPress,
  backgroundColor,
  color,
  topBoundary = 72,
}: DraggableFabProps) {
  const { width, height } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const pan = useRef(new Animated.ValueXY()).current;
  const currentX = useRef(0);
  const currentY = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const didInit = useRef(false);
  const movedBeyondTapSlop = useRef(false);

  const clampPosition = useMemo(
    () => (x: number, y: number) => {
      const maxX = Math.max(EDGE_PADDING, width - FAB_SIZE - EDGE_PADDING);
      const maxY = Math.max(
        EDGE_PADDING,
        height - FAB_SIZE - tabBarHeight - EDGE_PADDING,
      );
      const minY = Math.max(EDGE_PADDING, topBoundary);
      return {
        x: Math.min(Math.max(x, EDGE_PADDING), maxX),
        y: Math.min(Math.max(y, minY), maxY),
      };
    },
    [height, tabBarHeight, topBoundary, width],
  );

  const getSnapX = useMemo(
    () => (x: number) => {
      const minX = EDGE_PADDING;
      const maxX = Math.max(EDGE_PADDING, width - FAB_SIZE - EDGE_PADDING);
      const mid = (minX + maxX) / 2;
      return x <= mid ? minX : maxX;
    },
    [width],
  );

  useEffect(() => {
    const xSub = pan.x.addListener(({ value }) => {
      currentX.current = value;
    });
    const ySub = pan.y.addListener(({ value }) => {
      currentY.current = value;
    });

    return () => {
      pan.x.removeListener(xSub);
      pan.y.removeListener(ySub);
    };
  }, [pan.x, pan.y]);

  useEffect(() => {
    if (didInit.current) {
      const clamped = clampPosition(currentX.current, currentY.current);
      pan.setValue(clamped);
      return;
    }

    const initial = clampPosition(width - FAB_SIZE - 16, height - FAB_SIZE - tabBarHeight - 16);
    pan.setValue(initial);
    didInit.current = true;
  }, [clampPosition, height, pan, tabBarHeight, width]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          movedBeyondTapSlop.current = false;
          startX.current = currentX.current;
          startY.current = currentY.current;
        },
        onPanResponderMove: (_, gestureState) => {
          if (Math.abs(gestureState.dx) > TAP_SLOP || Math.abs(gestureState.dy) > TAP_SLOP) {
            movedBeyondTapSlop.current = true;
          }
          const next = clampPosition(startX.current + gestureState.dx, startY.current + gestureState.dy);
          pan.setValue(next);
        },
        onPanResponderRelease: () => {
          if (!movedBeyondTapSlop.current) {
            onPress();
            return;
          }

          const clamped = clampPosition(currentX.current, currentY.current);
          const snappedX = getSnapX(clamped.x);

          Animated.spring(pan, {
            toValue: { x: snappedX, y: clamped.y },
            useNativeDriver: false,
            stiffness: 320,
            damping: 32,
            mass: 0.9,
          }).start();
        },
      }),
    [clampPosition, getSnapX, onPress, pan],
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <FAB icon={icon} color={color} style={[styles.fab, styles.fabNoShadow, { backgroundColor }]} onPress={undefined} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 20,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabNoShadow: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
});

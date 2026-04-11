import React from 'react';
import { StyleSheet, View, ListRenderItem, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Text, useTheme } from 'react-native-paper';

interface IPhonePickerProps<T> {
  data: T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  renderLabel: (item: T) => string;
  itemHeight?: number;
}

export function IPhonePicker<T>({
  data,
  selectedValue,
  onValueChange,
  renderLabel,
  itemHeight = 54,
}: IPhonePickerProps<T>) {
  const theme = useTheme();
  const scrollY = useSharedValue(0);
  
  const selectedIndex = data.indexOf(selectedValue);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    if (data[clampedIndex] !== selectedValue) {
      onValueChange(data[clampedIndex]);
    }
  };

  const renderItem: ListRenderItem<T> = ({ item, index }) => {
    return (
      <Item
        item={item}
        index={index}
        scrollY={scrollY}
        itemHeight={itemHeight}
        renderLabel={renderLabel}
        theme={theme}
      />
    );
  };

  return (
    <View style={[styles.container, { height: itemHeight * 5 }]}>
      <View
        style={[
          styles.selectionIndicator,
          {
            height: itemHeight,
            top: itemHeight * 2,
            backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            borderColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            borderWidth: 1,
          },
        ]}
      />
      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScroll={onScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{
          paddingVertical: itemHeight * 2,
        }}
        initialScrollIndex={selectedIndex !== -1 ? selectedIndex : 0}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />
    </View>
  );
}

interface ItemProps<T> {
  item: T;
  index: number;
  scrollY: Animated.SharedValue<number>;
  itemHeight: number;
  renderLabel: (item: T) => string;
  theme: any;
}

function Item<T>({ item, index, scrollY, itemHeight, renderLabel, theme }: ItemProps<T>) {
  const animatedStyle = useAnimatedStyle(() => {
    const position = index * itemHeight;
    const distance = Math.abs(scrollY.value - position);
    const opacity = interpolate(
      distance,
      [0, itemHeight, itemHeight * 2],
      [1, 0.4, 0.15],
      'clamp'
    );
    const scale = interpolate(
      distance,
      [0, itemHeight, itemHeight * 2],
      [1.15, 0.95, 0.85],
      'clamp'
    );
    const rotateX = interpolate(
      scrollY.value - position,
      [-itemHeight * 2, 0, itemHeight * 2],
      [45, 0, -45],
      'clamp'
    );

    return {
      opacity,
      transform: [
        { scale }, 
        { perspective: 800 },
        { rotateX: `${rotateX}deg` }
      ],
    };
  });

  return (
    <Animated.View style={[styles.itemContainer, { height: itemHeight }, animatedStyle]}>
      <Text
        variant="titleLarge"
        style={[styles.itemText, { color: theme.colors.onBackground }]}
      >
        {renderLabel(item)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 16,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});

import React, { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { getListPressedBackground } from '@/shared/ui/listPressState';

type RenderItemParams<T> = {
  item: T;
  index: number;
  withDivider: boolean;
};

type AppListProps<T> = {
  data: readonly T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem?: (params: RenderItemParams<T>) => React.ReactNode;
  getItemText?: (item: T) => string;
  onItemPress?: (item: T, index: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  listStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  emptyComponent?: React.ReactElement | null;
  showDividers?: boolean;
  dividerInset?: number;
  itemHorizontalPadding?: number;
  itemVerticalPadding?: number;
  removeClippedSubviews?: boolean;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  onContentSizeChange?: (width: number, height: number) => void;
};

function AppListBase<T>({
  data,
  keyExtractor,
  renderItem,
  getItemText,
  onItemPress,
  containerStyle,
  listStyle,
  contentContainerStyle,
  emptyComponent,
  showDividers = true,
  dividerInset = 16,
  itemHorizontalPadding = 16,
  itemVerticalPadding = 12,
  removeClippedSubviews = true,
  initialNumToRender = 10,
  maxToRenderPerBatch = 10,
  windowSize = 5,
  onContentSizeChange,
}: AppListProps<T>) {
  const theme = useTheme();

  const renderDefaultItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const text = getItemText ? getItemText(item) : String(item);
      const onPress = onItemPress ? () => onItemPress(item, index) : undefined;

      return (
        <Pressable
          disabled={!onPress}
          onPress={onPress}
          android_ripple={onPress ? { color: getListPressedBackground(theme.dark) } : undefined}
          style={({ pressed }) => [
            styles.defaultRow,
            {
              paddingHorizontal: itemHorizontalPadding,
              paddingVertical: itemVerticalPadding,
            },
            pressed ? { backgroundColor: getListPressedBackground(theme.dark) } : null,
          ]}
        >
          <Text variant="titleMedium">{text}</Text>
        </Pressable>
      );
    },
    [getItemText, itemHorizontalPadding, itemVerticalPadding, onItemPress, theme.colors.surfaceVariant],
  );

  const renderListItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const withDivider = showDividers && index < data.length - 1;
      const content = renderItem
        ? renderItem({ item, index, withDivider })
        : renderDefaultItem({ item, index });

      return (
        <View style={styles.itemShell}>
          {content}
          {withDivider ? (
            <View
              style={[
                styles.divider,
                {
                  marginHorizontal: dividerInset,
                  backgroundColor: theme.colors.outlineVariant,
                },
              ]}
            />
          ) : null}
        </View>
      );
    },
    [data.length, dividerInset, renderDefaultItem, renderItem, showDividers, theme.colors.outlineVariant],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
        containerStyle,
      ]}
    >
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        style={listStyle}
        contentContainerStyle={contentContainerStyle}
        removeClippedSubviews={removeClippedSubviews}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        windowSize={windowSize}
        onContentSizeChange={onContentSizeChange}
        renderItem={renderListItem}
        ListEmptyComponent={emptyComponent}
      />
    </View>
  );
}

export const AppList = memo(AppListBase) as <T>(props: AppListProps<T>) => React.JSX.Element;

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemShell: {
    width: '100%',
  },
  defaultRow: {
    width: '100%',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});

import React, { forwardRef, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Icon, Text, useTheme } from 'react-native-paper';
import { AppBottomSheet } from '@/shared/ui/AppBottomSheet';
import { AppList } from '@/shared/ui/AppList';
import { getListPressedBackground } from '@/shared/ui/listPressState';

type AddEventActionSheetProps = {
  onAddEvent: () => void;
  onAddGroup: () => void;
};

export const AddEventActionSheet = forwardRef<BottomSheetModal, AddEventActionSheetProps>(
  ({ onAddEvent, onAddGroup }, ref) => {
    const theme = useTheme();
    const pressedBackground = getListPressedBackground(theme.dark);
    const snapPoints = useMemo(() => ['40%'], []);
    const options = useMemo(
      () => [
        {
          key: 'event',
          title: 'Add event',
          subtitle: 'Create a new event',
          icon: 'calendar-plus',
          onPress: onAddEvent,
        },
        {
          key: 'group',
          title: 'Add group',
          subtitle: 'Create a folder for events',
          icon: 'folder-plus',
          onPress: onAddGroup,
        },
      ],
      [onAddEvent, onAddGroup],
    );

    return (
      <AppBottomSheet ref={ref} title="Create" snapPoints={snapPoints}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <AppList
            data={options}
            keyExtractor={(item) => item.key}
            containerStyle={styles.listContainer}
            dividerInset={16}
            itemHorizontalPadding={0}
            itemVerticalPadding={0}
            renderItem={({ item }) => (
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.rowPressable,
                  pressed ? { backgroundColor: pressedBackground } : null,
                ]}
              >
                <View style={styles.row}>
                  <Icon source={item.icon} size={24} color={theme.colors.onSurfaceVariant} />
                  <View style={styles.rowContent}>
                    <Text variant="titleMedium">{item.title}</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      </AppBottomSheet>
    );
  },
);

AddEventActionSheet.displayName = 'AddEventActionSheet';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  listContainer: {
    marginHorizontal: 0,
  },
  rowPressable: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
});

import React, { forwardRef, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppBottomSheet } from '@/shared/ui/AppBottomSheet';
import { AppList } from '@/shared/ui/AppList';
import { getListPressedBackground } from '@/shared/ui/listPressState';

export type AddPersonActionSheetProps = {
  onAddManual: () => void;
  onImportContacts: () => void;
};

export const AddPersonActionSheet = forwardRef<BottomSheetModal, AddPersonActionSheetProps>(
  ({ onAddManual, onImportContacts }, ref) => {
    const theme = useTheme();
    const snapPoints = useMemo(() => ['40%'], []);
    const pressedBackground = getListPressedBackground(theme.dark);
    const options = useMemo(
      () => [
        {
          key: 'manual',
          title: 'Add manually',
          subtitle: 'Enter details manually',
          icon: 'account-plus',
          onPress: onAddManual,
        },
        {
          key: 'contacts',
          title: 'Import from contacts',
          subtitle: 'Select from your phone contacts',
          icon: 'account-box',
          onPress: onImportContacts,
        },
      ],
      [onAddManual, onImportContacts],
    );

    return (
      <AppBottomSheet
        ref={ref}
        title="Add person"
        snapPoints={snapPoints}
      >
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
                style={({ pressed }) => [styles.rowPressable, pressed ? { backgroundColor: pressedBackground } : null]}
              >
                <View style={styles.row}>
                  <Icon source={item.icon} size={24} color={theme.colors.onSurfaceVariant} />
                  <View style={styles.rowContent}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                      {item.title}
                    </Text>
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

AddPersonActionSheet.displayName = 'AddPersonActionSheet';

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

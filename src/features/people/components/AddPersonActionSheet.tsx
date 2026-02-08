import React, { forwardRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

export type AddPersonActionSheetProps = {
  onAddManual: () => void;
  onImportContacts: () => void;
};

export const AddPersonActionSheet = forwardRef<BottomSheetModal, AddPersonActionSheetProps>(
  ({ onAddManual, onImportContacts }, ref) => {
    const theme = useTheme();
    const snapPoints = useMemo(() => ['40%'], []);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        backgroundStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.roundness * 3,
          borderTopRightRadius: theme.roundness * 3,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      >
        <BottomSheetView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Add person
          </Text>

          <List.Item
            title="Add manually"
            description="Enter details manually"
            left={(props) => <List.Icon {...props} icon="account-plus" />}
            onPress={onAddManual}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <Divider style={styles.insetDivider} />
          <List.Item
            title="Import from contacts"
            description="Select from your phone contacts"
            left={(props) => <List.Icon {...props} icon="account-box" />}
            onPress={onImportContacts}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AddPersonActionSheet.displayName = 'AddPersonActionSheet';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingBottom: 12,
  },
  title: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  insetDivider: {
    marginHorizontal: 16,
  },
});

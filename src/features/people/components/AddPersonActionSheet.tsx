import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, List, useTheme } from 'react-native-paper';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppBottomSheet } from '../../../shared/ui/AppBottomSheet';

export type AddPersonActionSheetProps = {
  onAddManual: () => void;
  onImportContacts: () => void;
};

export const AddPersonActionSheet = forwardRef<BottomSheetModal, AddPersonActionSheetProps>(
  ({ onAddManual, onImportContacts }, ref) => {
    const theme = useTheme();
    const snapPoints = useMemo(() => ['40%'], []);

    return (
      <AppBottomSheet
        ref={ref}
        title="Add person"
        snapPoints={snapPoints}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <List.Item
            title="Add manually"
            description="Enter details manually"
            left={(props) => <List.Icon {...props} icon="account-plus" />}
            onPress={onAddManual}
            style={styles.insetItem}
            contentStyle={styles.itemContent}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <Divider style={styles.insetDivider} />
          <List.Item
            title="Import from contacts"
            description="Select from your phone contacts"
            left={(props) => <List.Icon {...props} icon="account-box" />}
            onPress={onImportContacts}
            style={styles.insetItem}
            contentStyle={styles.itemContent}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
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
  insetItem: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  itemContent: {
    paddingVertical: 2,
  },
  insetDivider: {
    marginHorizontal: 16,
  },
});

import React, { forwardRef, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Text, useTheme } from 'react-native-paper';

type AppBottomSheetProps = {
  title: string;
  children: React.ReactNode;
  snapPoints?: Array<string | number>;
};

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  ({ title, children, snapPoints }, ref) => {
    const theme = useTheme();
    const resolvedSnapPoints = useMemo(() => snapPoints ?? ['40%'], [snapPoints]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={resolvedSnapPoints}
        enablePanDownToClose
        keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'extend'}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableBlurKeyboardOnGesture={false}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.roundness * 3,
          borderTopRightRadius: theme.roundness * 3,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      >
        <BottomSheetView style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AppBottomSheet.displayName = 'AppBottomSheet';

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
});

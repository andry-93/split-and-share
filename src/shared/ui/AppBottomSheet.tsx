import React, { forwardRef, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Text, useTheme } from 'react-native-paper';

type AppBottomSheetProps = {
  title?: string;
  snapPoints?: Array<string | number>;
  children: React.ReactNode;
  useContainer?: boolean;
};

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  ({ title, children, snapPoints, useContainer = true }, ref) => {
    const theme = useTheme();
    const resolvedSnapPoints = useMemo(() => snapPoints ?? ['CONTENT_HEIGHT', '80%'], [snapPoints]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={resolvedSnapPoints}
        enableDynamicSizing
        enablePanDownToClose
        keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'extend'}
        android_keyboardInputMode="adjustResize"
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
        {useContainer ? (
          <BottomSheetView style={styles.content}>
            {title ? (
              <View style={styles.header}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {title}
                </Text>
              </View>
            ) : null}
            {children}
          </BottomSheetView>
        ) : (
          <>
            {title ? (
              <View style={styles.headerStandalone}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {title}
                </Text>
              </View>
            ) : null}
            {children}
          </>
        )}
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
  header: {
    marginBottom: 8,
  },
  headerStandalone: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});

import React, { PropsWithChildren, memo, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  useWindowDimensions,
  Platform,
  Pressable,
  KeyboardEvent,
  StyleSheet,
  View,
} from 'react-native';
import { Portal, useTheme } from 'react-native-paper';

type AppPopupProps = PropsWithChildren<{
  visible: boolean;
  onDismiss: () => void;
  onShow?: () => void;
}>;

export const AppPopup = memo(function AppPopup({
  visible,
  onDismiss,
  onShow,
  children,
}: AppPopupProps) {
  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [popupHeight, setPopupHeight] = useState(0);

  useEffect(() => {
    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const { popupShiftStyle, shouldStickToTop } = useMemo(() => {
    const topInset = 16;
    const availableHeight = Math.max(windowHeight - keyboardHeight, 0);
    const shouldTopAlign = popupHeight > availableHeight - topInset * 2;
    const desiredShift = keyboardHeight > 0 ? Math.min(keyboardHeight * 0.45, 220) : 0;
    const maxShift = Math.max((windowHeight - popupHeight) / 2 - topInset, 0);

    return {
      shouldStickToTop: shouldTopAlign,
      popupShiftStyle: {
        transform: [{ translateY: shouldTopAlign ? 0 : -Math.min(desiredShift, maxShift) }],
      },
    };
  }, [keyboardHeight, popupHeight, windowHeight]);

  useEffect(() => {
    if (visible) {
      return;
    }

    setKeyboardHeight(0);
    setPopupHeight(0);
  }, [visible]);

  useEffect(() => {
    if (!visible || !onShow) {
      return;
    }

    const timer = setTimeout(onShow, 0);
    return () => clearTimeout(timer);
  }, [onShow, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <View style={styles.backdropRoot}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <View style={[styles.popupContainer, shouldStickToTop && styles.popupContainerTop]}>
          <View
            onLayout={(event) => {
              setPopupHeight(event.nativeEvent.layout.height);
            }}
            style={[
              styles.popup,
              popupShiftStyle,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {children}
          </View>
        </View>
      </View>
    </Portal>
  );
});

const styles = StyleSheet.create({
  backdropRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  popupContainerTop: {
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  popup: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '86%',
  },
});

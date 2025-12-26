import React, {
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    View,
    Animated,
    PanResponder,
    Dimensions,
    Pressable,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    StyleSheet,
} from 'react-native';
import { Portal, Modal, useTheme } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { SNAP_POINTS, SnapPoint } from './types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_AUTO_HEIGHT = SCREEN_HEIGHT * 0.85;

type Props = {
    visible: boolean;
    onDismiss: () => void;
    onClosed?: () => void;
    children: ReactNode;
    snap?: SnapPoint;
};

export const BottomSheet = ({
                                visible,
                                onDismiss,
                                onClosed,
                                children,
                                snap = 'medium',
                            }: Props) => {
    const { colors, dark } = useTheme();
    const closingRef = useRef(false);

    const [measuredHeight, setMeasuredHeight] = useState(0);

    const effectiveHeight =
        snap === 'auto'
            ? Math.min(measuredHeight, MAX_AUTO_HEIGHT)
            : SCREEN_HEIGHT * SNAP_POINTS[snap];

    const translateY = useRef(
        new Animated.Value(effectiveHeight || SCREEN_HEIGHT)
    ).current;

    const backdropOpacity = useRef(
        new Animated.Value(0)
    ).current;

    const scrollY = useRef(0);

    /* =======================
       SYNC HEIGHT (IMPORTANT)
       ======================= */

    useEffect(() => {
        if (!visible && effectiveHeight > 0) {
            translateY.setValue(effectiveHeight);
        }
    }, [effectiveHeight, visible]);

    /* =======================
       OPEN
       ======================= */

    useEffect(() => {
        if (
            !visible ||
            closingRef.current ||
            effectiveHeight === 0
        ) {
            return;
        }

        translateY.setValue(effectiveHeight);
        backdropOpacity.setValue(0);

        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                damping: 26,
                stiffness: 200,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [visible, effectiveHeight]);

    /* =======================
       CLOSE
       ======================= */

    const close = () => {
        if (closingRef.current) return;
        closingRef.current = true;

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: effectiveHeight || SCREEN_HEIGHT,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            closingRef.current = false;
            onDismiss();
            onClosed?.();
        });
    };

    /* =======================
       PAN (SCROLL-AWARE)
       ======================= */

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) =>
                g.dy > 6 && scrollY.current === 0,

            onPanResponderMove: (_, g) => {
                if (g.dy > 0) {
                    translateY.setValue(g.dy);
                    backdropOpacity.setValue(
                        Math.max(
                            0,
                            1 - g.dy / effectiveHeight
                        )
                    );
                }
            },

            onPanResponderRelease: (_, g) => {
                if (g.dy > effectiveHeight * 0.25) {
                    close();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        damping: 26,
                        stiffness: 200,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    /* =======================
       SCROLL
       ======================= */

    const onScroll = (
        e: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        scrollY.current =
            e.nativeEvent.contentOffset.y;
    };

    /* =======================
       RENDER
       ======================= */

    return (
        <Portal>
            <Modal
                visible={visible}
                dismissable={false}
                contentContainerStyle={StyleSheet.absoluteFill}
            >
                {/* BACKDROP */}
                <Animated.View
                    pointerEvents={visible ? 'auto' : 'none'}
                    style={[
                        StyleSheet.absoluteFill,
                        { opacity: backdropOpacity },
                    ]}
                >
                    <BlurView
                        intensity={dark ? 40 : 60}
                        tint={dark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={close}
                    />
                </Animated.View>

                {/* SHEET */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        transform: [{ translateY }],
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        overflow: 'hidden',
                        maxHeight: MAX_AUTO_HEIGHT,
                    }}
                    onLayout={e => {
                        if (snap === 'auto') {
                            setMeasuredHeight(
                                e.nativeEvent.layout.height
                            );
                        }
                    }}
                >
                    {/* HANDLE */}
                    <View
                        style={{
                            alignSelf: 'center',
                            width: 36,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor:
                            colors.outlineVariant,
                            marginVertical: 12,
                        }}
                    />

                    <ScrollView
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={
                            snap !== 'auto' ||
                            measuredHeight > MAX_AUTO_HEIGHT
                        }
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                        }}
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
            </Modal>
        </Portal>
    );
};

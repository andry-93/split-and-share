import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    InteractionManager,
    Platform,
    View,
} from 'react-native';
import {
    Appbar,
    TextInput,
} from 'react-native-paper';

const APPBAR_HEIGHT = 56;

type Props = {
    title: string;

    /* SEARCH */
    searchVisible?: boolean;
    searchValue?: string;
    searchPlaceholder?: string;

    onSearchPress?: () => void;
    onSearchChange?: (value: string) => void;
    onSearchBlur?: () => void;

    /* SELECTION */
    selectionCount?: number;
    onClearSelection?: () => void;

    /* NAV */
    showBack?: boolean;
    onBack?: () => void;

    /* ACTIONS */
    actions?: React.ReactNode;
};

export const ScreenHeader = ({
    title,

    searchVisible = false,
    searchValue = '',
    searchPlaceholder,

    onSearchPress,
    onSearchChange,
    onSearchBlur,

    selectionCount = 0,
    onClearSelection,

    showBack = false,
    onBack,

    actions,
}: Props) => {
    const isSelectionMode = selectionCount > 0;

    /* =======================
       REFS
       ======================= */

    // @ts-ignore
    const inputRef = React.createRef<TextInput>();

    /* =======================
       STATE
       ======================= */

    const [actionsWidth, setActionsWidth] = useState(56);

    /* =======================
       ANIMATION VALUES
       ======================= */

    const inputAnim = useRef(
        new Animated.Value(searchVisible ? 1 : 0)
    ).current;

    const titleAnim = useRef(
        new Animated.Value(searchVisible ? 0 : 1)
    ).current;

    /* =======================
       EFFECT
       ======================= */

    useEffect(() => {
        if (searchVisible) {
            Animated.spring(inputAnim, {
                toValue: 1,
                damping: 18,
                stiffness: 180,
                mass: 0.8,
                useNativeDriver: true,
            }).start();

            Animated.timing(titleAnim, {
                toValue: 0,
                duration: 120,
                delay: 40,
                useNativeDriver: true,
            }).start();

            InteractionManager.runAfterInteractions(() => {
                inputRef.current?.focus();
            });
        } else {
            Animated.timing(inputAnim, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }).start();

            Animated.spring(titleAnim, {
                toValue: 1,
                damping: 20,
                stiffness: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [searchVisible]);

    /* =======================
       STYLES
       ======================= */

    const inputStyle = {
        opacity: inputAnim,
        transform: [
            {
                translateX: inputAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [32, 0],
                }),
            },
            {
                scaleX: inputAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                }),
            },
        ],
    };

    const titleStyle = {
        opacity: titleAnim,
        transform: [
            {
                translateX: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 0],
                }),
            },
        ],
    };

    /* =======================
       RENDER
       ======================= */

    return (
        <Appbar.Header>
            {/* BACK */}
            {showBack && (
                <Appbar.BackAction onPress={onBack} />
            )}

            {/* TITLE */}
            {!isSelectionMode &&
                (Platform.OS === 'ios' ? (
                    <Animated.View
                        pointerEvents={searchVisible ? 'none' : 'auto'}
                        style={[
                            {
                                position: 'absolute',
                                left: 56,
                                right: actions ? actionsWidth : 56,
                                height: APPBAR_HEIGHT,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            },
                            titleStyle,
                        ]}
                    >
                        <Appbar.Content
                            title={title}
                            titleStyle={{
                                fontSize: 17,
                                fontWeight: '600',
                                lineHeight: 22,
                                textAlign: 'center',
                            }}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View
                        pointerEvents={searchVisible ? 'none' : 'auto'}
                        style={[
                            {
                                flex: 1,
                                height: APPBAR_HEIGHT,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingLeft: showBack ? 0 : 8,
                            },
                            titleStyle,
                        ]}
                    >
                        <Appbar.Content
                            title={title}
                            titleStyle={{
                                fontSize: 20,
                                lineHeight: 24,
                            }}
                        />
                    </Animated.View>
                ))}

            {/* SEARCH INPUT */}
            {!isSelectionMode && (
                <Animated.View
                    pointerEvents={searchVisible ? 'auto' : 'none'}
                    style={[
                        {
                            position: 'absolute',
                            left: showBack ? 56 : 16,
                            right: actions ? actionsWidth : 16,
                            height: APPBAR_HEIGHT,
                            justifyContent: 'center',
                        },
                        inputStyle,
                    ]}
                >
                    <TextInput
                        ref={inputRef}
                        value={searchValue}
                        onChangeText={onSearchChange}
                        onBlur={onSearchBlur}
                        placeholder={searchPlaceholder}
                        mode="flat"
                        dense
                        underlineColor="transparent"
                        style={{
                            backgroundColor: 'transparent',
                        }}
                    />
                </Animated.View>
            )}

            {/* SEARCH BUTTON */}
            {!searchVisible &&
                !isSelectionMode &&
                onSearchPress && (
                    <Appbar.Action
                        icon="magnify"
                        onPress={onSearchPress}
                    />
                )}

            {/* ACTIONS */}
            {actions && (
                <View
                    onLayout={(e) => {
                        const width = e.nativeEvent.layout.width;
                        if (width > 0 && width !== actionsWidth) {
                            setActionsWidth(width);
                        }
                    }}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    {actions}
                </View>
            )}

            {/* CLEAR SELECTION */}
            {isSelectionMode &&
                onClearSelection && (
                    <Appbar.Action
                        icon="close"
                        onPress={onClearSelection}
                    />
                )}
        </Appbar.Header>
    );
};

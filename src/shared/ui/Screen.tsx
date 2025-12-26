import { ReactNode } from 'react';
import { View } from 'react-native';
import {
    Appbar,
    useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = {
    title?: string;
    showBack?: boolean;
    customHeader?: ReactNode;
    children: ReactNode;
};

export const Screen = ({
    title,
    showBack,
    customHeader,
    children,
}: ScreenProps) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top,
            }}
        >
            {/* ===== HEADER ===== */}
            {customHeader ? (
                customHeader
            ) : title ? (
                <Appbar.Header>
                    {showBack && (
                        <Appbar.BackAction
                            onPress={() => navigation.goBack()}
                        />
                    )}
                    <Appbar.Content title={title} />
                </Appbar.Header>
            ) : null}

            {/* ===== CONTENT ===== */}
            <View style={{ flex: 1 }}>
                {children}
            </View>
        </View>
    );
};

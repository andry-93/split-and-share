import React from 'react';
import { View } from 'react-native';
import {
    Appbar,
    TextInput,
    useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

type Props = {
    title: string;
    showBack?: boolean;
    onBack?: () => void;

    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;

    selectionCount?: number;
    onClearSelection?: () => void;
    actions?: React.ReactNode;
};

export const ScreenHeader = ({
    title,
    showBack,
    onBack,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    selectionCount = 0,
    onClearSelection,
    actions,
}: Props) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const hasSearch =
        typeof searchValue === 'string' &&
        typeof onSearchChange === 'function';

    const isSelectionMode = selectionCount > 0;

    return (
        <Appbar.Header>
            {/* BACK */}
            {showBack && (
                <Appbar.BackAction
                    onPress={
                        selectionCount && selectionCount > 0
                            ? onClearSelection
                            : onBack
                    }
                />
            )}

            {/* TITLE / SEARCH */}
            {hasSearch && !isSelectionMode ? (
                <View style={{ flex: 1 }}>
                    <TextInput
                        value={searchValue}
                        onChangeText={onSearchChange}
                        placeholder={searchPlaceholder ?? t('search')}
                        mode="flat"
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        style={{
                            height: 40,
                            marginHorizontal: 8,
                            backgroundColor: colors.surfaceVariant,
                            borderRadius: 4,
                            overflow: 'hidden',
                        }}
                        contentStyle={{
                            paddingHorizontal: 0,
                        }}
                        left={
                            <TextInput.Icon
                                icon="magnify"
                                color={colors.onSurfaceVariant}
                            />
                        }
                        right={
                            searchValue ? (
                                <TextInput.Icon
                                    icon="close"
                                    onPress={() => onSearchChange('')}
                                />
                            ) : null
                        }
                    />
                </View>
            ) : (
                <Appbar.Content
                    title={
                        isSelectionMode
                            ? `${selectionCount}`
                            : title
                    }
                />
            )}

            {/* ACTIONS */}
            {actions}
        </Appbar.Header>
    );
};
